import userModel from "../models/userModel.js";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import doctorModel from "../models/doctorModel.js";
import labModel from "../models/labModel.js";
import axios from "axios";
import jwt from "jsonwebtoken";

// Helper function to get system prompt
const getSystemPrompt = async (fileInfo = "", user = null) => {
  let prompt = `You are Roshetta Assistant, a helpful assistant for the Roshetta healthcare platform, which allows users to book appointments with doctors and labs in Egypt. The platform uses Egyptian Pounds (EGP) as currency. 

You can help users with:
- Booking appointments with doctors
- Viewing their appointment history
- Providing healthcare information
- Analyzing uploaded medical files

Important: When greeting users, always use their name if available. Be personal and friendly.`;

  if (user) {
    prompt += `\n\nCURRENT USER INFORMATION:
- Name: ${user.name}
- Email: ${user.email}
- Blood Type: ${user.bloodType || "not specified"}
- Medical Insurance: ${user.medicalInsurance || "not specified"}
- Gender: ${user.gender || "not specified"}
- Birth Date: ${user.birthDate || "not specified"}`;

    if (user.allergy && Object.keys(user.allergy).length > 0) {
      prompt += `\n- Allergies: ${Object.entries(user.allergy)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")}`;
    } else {
      prompt += `\n- Allergies: None recorded`;
    }

    if (user.address && (user.address.line1 || user.address.line2)) {
      prompt += `\n- Address: ${user.address.line1 || ""} ${
        user.address.line2 || ""
      }`.trim();
    }

    try {
      const appointments = await appointmentDoctorModel
        .find({ userId: user._id.toString() })
        .populate("docData")
        .sort({ date: -1 })
        .limit(10);

      if (appointments.length > 0) {
        prompt += `\n\nUSER'S RECENT APPOINTMENTS:`;
        appointments.forEach((apt, index) => {
          const status = apt.cancelled
            ? "Cancelled"
            : apt.isCompleted
            ? "Completed"
            : apt.payment
            ? "Paid/Scheduled"
            : "Pending Payment";
          prompt += `\n${index + 1}. Dr. ${apt.docData.name} (${
            apt.docData.specialty
          }) - ${apt.slotDate.replace(/_/g, "/")} at ${
            apt.slotTime
          } - Status: ${status} - Fee: ${apt.amount} EGP`;
        });

        prompt += `\n\nWhen user asks about appointments, show this information and explain the status of each.`;
      } else {
        prompt += `\n\nUSER'S APPOINTMENTS: No appointments found.`;
      }
    } catch (error) {
      console.error("Error fetching user appointments for prompt:", error);
      prompt += `\n\nUSER'S APPOINTMENTS: Unable to fetch appointment data.`;
    }

    if (user.uploadedFiles && user.uploadedFiles.length > 0) {
      prompt += `\n\nUSER'S UPLOADED FILES:`;
      user.uploadedFiles.forEach((file, index) => {
        prompt += `\n${index + 1}. ${file.type} (${new Date(
          file.createdAt
        ).toLocaleDateString()})`;
        if (file.transcription) {
          prompt += ` - Audio transcription: "${file.transcription.substring(
            0,
            100
          )}${file.transcription.length > 100 ? "..." : ""}"`;
        }
      });
    }
  } else {
    prompt += `\n\nThis is an unauthenticated user. Greet them politely and ask them to log in for personalized features like booking appointments or viewing appointment history.`;
  }

  if (fileInfo) {
    prompt += `\n\nFILE CONTEXT: ${fileInfo}`;
  }

  try {
    const doctors = await doctorModel
      .find({ available: true })
      .select("name specialty fees")
      .lean();

    if (doctors.length > 0) {
      prompt += `\n\nAVAILABLE DOCTORS:`;
      doctors.forEach((doc) => {
        prompt += `\n- Dr. ${doc.name} (${doc.specialty}) - Consultation Fee: ${doc.fees} EGP`;
      });
    }

    try {
      const labs = await labModel
        .find({ available: true })
        .select("name services")
        .lean();

      if (labs.length > 0) {
        prompt += `\n\nAVAILABLE LABS:`;
        labs.forEach((lab) => {
          prompt += `\n- ${lab.name} (Services: ${lab.services.join(", ")})`;
        });
      }
    } catch (labError) {
      console.log("Lab model not available:", labError.message);
    }
  } catch (error) {
    console.error("Error fetching doctors for prompt:", error);
    prompt += `\n\nNote: Unable to fetch current doctor availability.`;
  }

  prompt += `\n\nIMPORTANT INSTRUCTIONS:
- Always address the user by name when possible
- When asked about appointments, provide detailed information about each appointment including status
- For booking appointments, guide users through the process step by step
- If user wants to book an appointment, ask for: doctor preference, date, and time
- Always be helpful, professional, and empathetic
- If you cannot perform an action directly, explain what the user needs to do`;

  return prompt;
};

// Helper function to extract appointment details from user message
const extractAppointmentDetails = (userMessage, botResponse) => {
  const message = userMessage.toLowerCase();

  const doctors = ["dr. nour", "nour", "dermatologist"];
  let foundDoctor = null;

  for (const doctor of doctors) {
    if (message.includes(doctor)) {
      foundDoctor = doctor;
      break;
    }
  }

  const timePatterns = [
    /(\d{1,2})\s*(pm|am)/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /next\s+(week|monday|tuesday|wednesday|thursday|friday)/i,
  ];

  let foundTime = null;
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      foundTime = match[0];
      break;
    }
  }

  if (foundDoctor || foundTime) {
    return {
      doctor: foundDoctor,
      timeRequest: foundTime,
      fullMessage: userMessage,
    };
  }

  return null;
};

// Enhanced getChatResponse function
const getChatResponse = async (req, res) => {
  try {
    const { message, fileInfo } = req.body;
    if (!message) {
      return res.json({ success: false, message: "Message is required" });
    }

    console.log("Processing chat message:", message);

    // Fetch user if authenticated
    let user = null;
    const token = req.headers.token;
    if (token) {
      try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        user = await userModel.findById(token_decode.id).select("-password");
        console.log("Authenticated user:", user?.name);
      } catch (error) {
        console.log("Token verification failed:", error.message);
      }
    }

    // Check if this is an appointment booking request
    const isBookingRequest =
      message.toLowerCase().includes("book") ||
      message.toLowerCase().includes("appointment") ||
      message.toLowerCase().includes("schedule");

    const systemPrompt = await getSystemPrompt(fileInfo, user);

    console.log("Calling OpenAI API...");

    // Enhanced prompt for appointment booking
    let enhancedMessage = message;
    if (isBookingRequest && user) {
      enhancedMessage += `\n\nNote: This user wants to book an appointment. If they specify a doctor, date, and time, you can guide them to complete the booking through the platform.`;
    }

    // Call OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: enhancedMessage },
        ],
        max_tokens: 600,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices[0].message.content.trim();
    console.log("OpenAI response received, length:", botReply.length);

    // Check if user wants to book an appointment and extract details
    if (user && isBookingRequest) {
      const appointmentDetails = extractAppointmentDetails(message, botReply);
      if (appointmentDetails) {
        const bookingInstructions = `\n\nTo complete your appointment booking with ${appointmentDetails.doctor}, please visit the doctor's page on our platform or use the appointment booking section. You'll need to select your preferred time slot and confirm the booking.`;
        return res.json({
          success: true,
          reply: botReply + bookingInstructions,
          appointmentSuggestion: appointmentDetails,
        });
      }
    }

    res.json({ success: true, reply: botReply });
  } catch (error) {
    console.error("Error getting chat response:", error);
    res.json({
      success: false,
      message: "Failed to get response from AI. Please try again.",
    });
  }
};

export { getChatResponse, getSystemPrompt, extractAppointmentDetails };