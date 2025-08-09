import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";
import axios from "axios";
import stripe from "stripe";
import PDFParser from "pdf2json";
import tempFileModel from "../models/tempFileModel.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";
import transporter from "../config/nodemailer.js";
import FormData from "form-data";
import labModel from "../models/labModel.js";

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Function to get audio duration
const getAudioDuration = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    ffmpeg(stream).ffprobe((err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.format.duration);
      }
    });
  });
};

// API to register user
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      bloodType,
      medicalInsurance,
      gender,
      birthDate,
      allergy,
    } = req.body;
    if (
      !name ||
      !password ||
      !email ||
      !mobile ||
      !bloodType ||
      !medicalInsurance ||
      !gender ||
      !birthDate
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter Valid Email" });
    }

    // Validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter Strong Password" });
    }

    // Validating mobile format
    if (!validator.isMobilePhone(mobile, "any")) {
      return res.json({ success: false, message: "Enter Valid Mobile Number" });
    }

    // Validating gender
    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.json({ success: false, message: "Invalid Gender" });
    }

    // Validating birth date
    if (!validator.isDate(birthDate)) {
      return res.json({ success: false, message: "Enter Valid Birth Date" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    const userData = {
      name,
      email,
      mobile,
      password: hashedPassword,
      bloodType,
      medicalInsurance,
      gender,
      birthDate,
      allergy: allergy || {},
      address: { line1: "", line2: "" },
      isAccountVerified: false,
      verifyOtp: otp,
      verifyOtpExpireAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
    };

    const newUser = new userModel(userData);
    await newUser.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify Your Kamma-Pharma Account",
      text: `Hello ${name},\n\nThanks for registering.\n\nYour OTP is: ${otp}\n\nPlease verify your account within 24 hours.\n\n– Kamma-Pharma Team`,
    };
    await transporter.sendMail(mailOptions);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    res.json({
      success: true,
      token,
      message: "OTP sent to your email. Please verify your account.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.json({ success: false, message: error.message });
  }
};

// check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Fixed uploadAudio function with better error handling and proper FormData setup
const uploadAudio = async (req, res) => {
  try {
    console.log("Upload audio endpoint hit");

    if (!req.file) {
      console.log("No file received");
      return res
        .status(400)
        .json({ success: false, message: "No audio file uploaded." });
    }

    console.log("File received:", {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fieldname: req.file.fieldname,
    });

    // Basic file size validation (10MB limit - increased for better compatibility)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 10MB limit.",
      });
    }

    // Validate file type
    const allowedMimeTypes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/m4a",
      "audio/ogg",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.log("Invalid mime type:", req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: "Unsupported audio format. Please use WebM, WAV, MP3, or M4A.",
      });
    }

    // Upload audio to Cloudinary first
    console.log("Uploading to Cloudinary...");
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video", // Use "video" for audio files in Cloudinary
            folder: "roshetta/audio",
            timeout: 60000,
            format: "webm", // Ensure consistent format
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload success:", result.secure_url);
              resolve(result);
            }
          }
        )
        .end(req.file.buffer);
    });

    // Transcribe audio using OpenAI Whisper API
    console.log("Starting transcription...");
    let transcription = "";
    let transcriptionSuccess = false;

    try {
      // Import FormData at the top of the file if not already imported
      const formData = new FormData();

      // Create a proper file-like object for the FormData
      const audioBuffer = req.file.buffer;
      const fileName = req.file.originalname || "audio.webm";
      const mimeType = req.file.mimetype || "audio/webm";

      // Append the audio buffer as a blob-like object
      formData.append("file", audioBuffer, {
        filename: fileName,
        contentType: mimeType,
      });

      formData.append("model", "whisper-1");
      formData.append("language", "en"); // You can make this dynamic based on user preference

      // Optional: Add response format for better handling
      formData.append("response_format", "json");

      console.log("Sending to OpenAI Whisper API...", {
        fileSize: audioBuffer.length,
        fileName,
        mimeType,
      });

      const transcriptionResponse = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 seconds timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log("OpenAI Response:", transcriptionResponse.data);

      if (transcriptionResponse.data && transcriptionResponse.data.text) {
        transcription = transcriptionResponse.data.text.trim();
        console.log("Transcription successful:", transcription);

        // Check if transcription is meaningful (not just empty or very short)
        if (transcription.length < 2) {
          console.log("Transcription too short:", transcription);
          transcription =
            "Audio was too short or unclear. Please try speaking more clearly or for a longer duration.";
          transcriptionSuccess = false;
        } else {
          transcriptionSuccess = true;
        }
      } else {
        console.log("No text in response:", transcriptionResponse.data);
        transcription =
          "No speech detected in the audio. Please try recording again.";
        transcriptionSuccess = false;
      }
    } catch (transcriptionError) {
      console.error("Transcription error details:", {
        message: transcriptionError.message,
        response: transcriptionError.response?.data,
        status: transcriptionError.response?.status,
        code: transcriptionError.code,
        headers: transcriptionError.response?.headers,
      });

      // More specific error handling based on the error type
      if (transcriptionError.code === "ECONNABORTED") {
        transcription =
          "Transcription timed out. Please try with a shorter audio file.";
      } else if (transcriptionError.response?.status === 400) {
        const errorMessage =
          transcriptionError.response?.data?.error?.message || "Bad request";
        console.error("OpenAI 400 Error:", errorMessage);

        if (errorMessage.includes("audio file")) {
          transcription =
            "Invalid audio file format. Please try recording again.";
        } else if (errorMessage.includes("too large")) {
          transcription =
            "Audio file is too large. Please try a shorter recording.";
        } else {
          transcription =
            "Audio format not supported. Please try recording again.";
        }
      } else if (transcriptionError.response?.status === 401) {
        transcription = "Authentication failed. Please contact support.";
        console.error("OpenAI API Key issue - Status 401");
      } else if (transcriptionError.response?.status === 413) {
        transcription = "Audio file too large. Please use a smaller file.";
      } else if (transcriptionError.response?.status === 429) {
        transcription =
          "Too many requests. Please wait a moment and try again.";
      } else {
        transcription =
          "Transcription service is temporarily unavailable. Please try again or type your message.";
      }

      transcriptionSuccess = false;
    }

    // Store metadata in MongoDB
    try {
      const fileData = {
        type: "audio",
        url: cloudinaryResult.secure_url,
        transcription,
        transcriptionSuccess, // Add this field to track success
        createdAt: new Date(),
      };

      if (req.userId) {
        console.log("Saving to authenticated user:", req.userId);
        await userModel.findByIdAndUpdate(req.userId, {
          $push: {
            uploadedFiles: fileData,
          },
        });
      } else {
        console.log("Saving to temp file collection");
        const tempFile = new tempFileModel({
          ...fileData,
          sessionId: req.sessionID || "anonymous",
        });
        await tempFile.save();
      }
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue even if DB save fails - don't let this break the response
    }

    console.log("Upload audio completed", {
      transcriptionSuccess,
      transcriptionLength: transcription.length,
    });

    // Always return success from upload perspective, but indicate transcription status
    const responseMessage = transcriptionSuccess
      ? "Audio uploaded and transcribed successfully"
      : "Audio uploaded but transcription failed";

    // Return the response
    res.status(200).json({
      success: true, // Always true for upload success
      transcription,
      transcriptionSuccess, // Let the frontend know if transcription worked
      fileUrl: cloudinaryResult.secure_url,
      message: responseMessage,
    });
  } catch (error) {
    console.error("Error uploading audio:", error);
    res.status(500).json({
      success: false,
      message: `Upload failed: ${error.message}`,
    });
  }
};

// API to upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "roshetta/files" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    // Store metadata in MongoDB (for authenticated users only)
    if (req.userId) {
      await userModel.findByIdAndUpdate(req.userId, {
        $push: {
          uploadedFiles: {
            type: req.file.mimetype,
            url: result.secure_url,
            createdAt: Date.now(),
          },
        },
      });
    } else {
      const tempFile = new tempFileModel({
        type: req.file.mimetype,
        url: result.secure_url,
        createdAt: Date.now(),
        sessionId: req.sessionID || "anonymous",
      });
      await tempFile.save();
    }

    res.status(200).json({ success: true, fileUrl: result.secure_url });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to analyze image
const analyzeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Analyze medical prescriptions from images. Extract details such as medication names, dosages, and instructions. If the image is unclear or not a prescription, state so.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this prescription image." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.json({
      success: true,
      analysis: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to analyze PDF text
const analyzePdfText = async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ success: false, message: "No PDF file uploaded." });
    }

    // Upload PDF to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "roshetta/files" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    // Extract text from PDF using pdf2json
    const pdfParser = new PDFParser();
    let text = "";
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      text = pdfParser.getRawTextContent();
    });
    pdfParser.on("pdfParser_dataError", (errData) => {
      throw new Error(errData.parserError);
    });
    await new Promise((resolve, reject) => {
      pdfParser.parseBuffer(req.file.buffer);
      pdfParser.on("end", resolve);
      pdfParser.on("error", reject);
    });

    // Analyze text using Open AI
    const textAnalysisResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Analyze medical prescriptions from text. Extract details such as medication names, dosages, and instructions. If the text is unclear or not a prescription, state so.",
          },
          {
            role: "user",
            content: `Analyze this prescription text: ${text}`,
          },
        ],
        max_tokens: 100,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    // Store metadata
    if (req.userId) {
      await userModel.findByIdAndUpdate(req.userId, {
        $push: {
          uploadedFiles: {
            type: "application/pdf",
            url: result.secure_url,
            textContent: text,
            createdAt: Date.now(),
          },
        },
      });
    } else {
      const tempFile = new tempFileModel({
        type: "application/pdf",
        url: result.secure_url,
        textContent: text,
        sessionId: req.sessionID || "anonymous",
        createdAt: Date.now(),
      });
      await tempFile.save();
    }

    res.json({
      success: true,
      text,
      fileUrl: result.secure_url,
      analysis: textAnalysisResponse.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error analyzing PDF text:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    // Get user's appointments
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

  // Fetch and include available doctors
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

    // Fetch labs if available
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
        // Add booking instructions to the response
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

// Helper function to extract appointment details from user message
const extractAppointmentDetails = (userMessage, botResponse) => {
  const message = userMessage.toLowerCase();

  // Look for doctor names mentioned
  const doctors = ["dr. nour", "nour", "dermatologist"];
  let foundDoctor = null;

  for (const doctor of doctors) {
    if (message.includes(doctor)) {
      foundDoctor = doctor;
      break;
    }
  }

  // Look for time patterns
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

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Doesn't Exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else if (!user.isAccountVerified) {
      return res.json({
        success: false,
        message: `Please Check Your Mailbox ${email} to verify your account first before logging in`,
      });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      address,
      birthDate,
      gender,
      medicalInsurance,
      allergy,
    } = req.body;
    const imageProfile = req.file;
    if (!name || !phone || !birthDate || !gender || !medicalInsurance) {
      return res.json({ success: false, message: "Data Missing" });
    }
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      birthDate,
      gender,
      medicalInsurance,
      allergy: JSON.parse(allergy) || {},
    });
    if (imageProfile) {
      const imageUpload = await cloudinary.uploader.upload(imageProfile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }
    let slotsBooked = docData.slotsBooked;
    if (slotsBooked[slotDate]) {
      if (slotsBooked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot Not Available" });
      } else {
        slotsBooked[slotDate].push(slotTime);
      }
    } else {
      slotsBooked[slotDate] = [];
      slotsBooked[slotDate].push(slotTime);
    }
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.json({ success: false, message: "User Not Found" });
    }
    delete docData.slotsBooked;
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };
    const newAppointment = new appointmentDoctorModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const doctorAppointments = await appointmentDoctorModel.find({
      userId: userId.toString(),
    });
    const labAppointments = await appointmentLabModel.find({
      userId: userId.toString(),
    });
    const appointments = [...doctorAppointments, ...labAppointments].map(
      (appt) => ({
        ...appt._doc,
        status: appt.cancelled
          ? "Cancelled"
          : appt.isCompleted
          ? "Completed"
          : "Scheduled",
        paymentStatus: appt.payment ? "Paid" : "Not Paid",
      })
    );
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    let appointmentData = await appointmentDoctorModel.findById(appointmentId);
    let isDoctorAppointment = true;

    if (!appointmentData) {
      appointmentData = await appointmentLabModel.findById(appointmentId);
      isDoctorAppointment = false;
      if (!appointmentData) {
        return res.json({ success: false, message: "Appointment Not Found" });
      }
    }

    if (appointmentData.userId !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    await (isDoctorAppointment
      ? appointmentDoctorModel
      : appointmentLabModel
    ).findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, labId, slotDate, slotTime } = appointmentData;
    const targetId = isDoctorAppointment ? docId : labId;
    const model = isDoctorAppointment ? doctorModel : labModel;
    const targetData = await model.findById(targetId);
    let slotsBooked = targetData.slotsBooked;
    slotsBooked[slotDate] = slotsBooked[slotDate].filter((e) => e !== slotTime);
    await model.findByIdAndUpdate(targetId, { slotsBooked });
    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Helper function to get Paymob auth token
const getAuthToken = async () => {
  try {
    const rawKey = process.env.PAYMOB_API_KEY;
    if (!rawKey) {
      throw new Error("PAYMOB_API_KEY is not defined in environment variables");
    }
    const cleanedKey = rawKey.trim();

    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/auth/tokens",
      { api_key: cleanedKey },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error("DEBUG: Paymob Auth Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(
      `Paymob Auth Token Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Helper function to register Paymob appointment
const registerAppointment = async (
  authToken,
  amountCents,
  merchantAppointmentId
) => {
  try {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: "EGP",
        merchant_order_id: merchantAppointmentId.toString(),
      }
    );
    return response.data.id;
  } catch (error) {
    throw new Error(
      `Paymob register Appointment Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Helper function to get Paymob payment key
const getPaymentKey = async (
  authToken,
  amountCents,
  appointmentId,
  billingData,
  integrationId,
  origin
) => {
  try {
    const payload = {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: appointmentId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: integrationId,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    };
    console.log("DEBUG: getPaymentKey Payload:", payload);
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/acceptance/payment_keys",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("DEBUG: getPaymentKey Response:", response.data);
    return response.data.token;
  } catch (error) {
    console.error("DEBUG: getPaymentKey Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(
      `Paymob get payment key Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API to pay for appointment with Paymob
const payAppointmentPaymob = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    let appointment = await appointmentDoctorModel.findById(appointmentId);
    let isDoctorAppointment = true;
    if (!appointment) {
      appointment = await appointmentLabModel.findById(appointmentId);
      isDoctorAppointment = false;
      if (!appointment) {
        return res.json({ success: false, message: "Appointment Not Found" });
      }
    }

    if (appointment.userId !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Appointment Already Paid" });
    }
    if (appointment.cancelled) {
      return res.json({ success: false, message: "Appointment Cancelled" });
    }

    const amountCents = Math.floor(appointment.amount * 100);

    const user = await userModel.findById(userId);
    const billingData = {
      first_name: user.name.split(" ")[0] || "Unknown",
      last_name: user.name.split(" ")[1] || "Unknown",
      email: user.email || "no-email@domain.com",
      phone_number: user.mobile ? `+2${user.mobile}` : "+201000000000",
      street: "Unknown",
      building: "Unknown",
      floor: "Unknown",
      apartment: "Unknown",
      city: "Cairo",
      state: "Cairo",
      country: "EGY",
      postal_code: "00000",
    };

    const authToken = await getAuthToken();
    const paymobAppointmentId = await registerAppointment(
      authToken,
      amountCents,
      appointmentId
    );
    const paymentKey = await getPaymentKey(
      authToken,
      amountCents,
      paymobAppointmentId,
      billingData,
      process.env.PAYMOB_INTEGRATION_ID,
      origin
    );

    const paymentUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
    res.json({ success: true, url: paymentUrl });
  } catch (error) {
    console.error("DEBUG: payAppointmentPaymob Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.json({ success: false, message: error.message });
  }
};

// API to pay for appointment with Stripe
const payAppointmentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    console.log(`Processing Stripe payment for appointment: ${appointmentId}`);

    let appointment = await appointmentDoctorModel.findById(appointmentId);
    let isDoctorAppointment = true;

    if (!appointment) {
      appointment = await appointmentLabModel.findById(appointmentId);
      isDoctorAppointment = false;

      if (!appointment) {
        console.error(`Appointment not found: ${appointmentId}`);
        return res.json({ success: false, message: "Appointment Not Found" });
      }
    }

    // Validation checks
    if (appointment.userId !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Appointment Already Paid" });
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: "Appointment Cancelled" });
    }

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: isDoctorAppointment
              ? `Appointment with ${appointment.docData.name}`
              : `Lab Test - ${appointment.docData.name}`,
            description: `Date: ${appointment.slotDate}, Time: ${appointment.slotTime}`,
          },
          unit_amount: Math.floor(appointment.amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
      cancel_url: `${origin}/cancel?appointment_id=${appointmentId}`,
      metadata: {
        appointmentId: appointment._id.toString(),
        userId,
        isDoctorAppointment: isDoctorAppointment.toString(),
      },
      // Add customer email if available
      customer_email: appointment.userData.email || undefined,
    });

    console.log(
      `✅ Stripe session created: ${session.id} for appointment: ${appointmentId}`
    );

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe payment error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Existing order payment functions
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }
    let productData = [];
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);
    amount += Math.floor(amount * 0);
    const Appointment = await Appointment.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "egp",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.14) * 100,
        },
        quantity: item.quantity,
      };
    });
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        AppointmentId: Appointment._id.toString(),
        userId,
      },
    });
    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const placeOrderPaymob = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address, shippingFee } = req.body;
    const { origin } = req.headers;

    console.log("DEBUG: placeOrderPaymob Input:", {
      userId,
      items,
      address,
      shippingFee,
    });

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }

    const productTotals = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.product} not found`);
        return product.offerPrice * item.quantity;
      })
    );
    let amount = productTotals.reduce((acc, val) => acc + val, 0);
    amount += shippingFee || 0;
    amount += Math.floor(amount * 0);
    amount = Math.floor(amount * 100);
    console.log("DEBUG: Calculated Amount (cents):", amount);
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const Appointment = await Appointment.create({
      userId,
      items,
      amount: amount / 100,
      address,
      paymentType: "Online",
      status: "Pending Payment",
    });
    console.log("DEBUG: Created Appointment:", Appointment._id);

    const user = await User.findById(userId);
    const addressDoc = await Address.findById(address);
    if (!addressDoc) throw new Error(`Address ${address} not found`);
    console.log("DEBUG: User Data:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    console.log("DEBUG: Address Data:", addressDoc);

    const authToken = await getAuthToken();
    console.log("DEBUG: Auth Token:", authToken);
    const paymobAppointmentId = await registerAppointment(
      authToken,
      amount,
      Appointment._id
    );
    console.log("DEBUG: Paymob Appointment ID:", paymobAppointmentId);

    const billingData = {
      first_name: addressDoc.firstName || user.name.split(" ")[0] || "Unknown",
      last_name: addressDoc.lastName || user.name.split(" ")[1] || "Unknown",
      email: addressDoc.email || user.email || "no-email@domain.com",
      phone_number: addressDoc.phone
        ? `+2${addressDoc.phone}`
        : user.phone
        ? `+2${user.phone}`
        : "+201000000000",
      street: addressDoc.street || "Unknown",
      building: addressDoc.building || "Unknown",
      floor: addressDoc.floor || "Unknown",
      apartment: addressDoc.apartment || "Unknown",
      city: addressDoc.city || "Cairo",
      state: addressDoc.state || "Cairo",
      country:
        addressDoc.country?.toUpperCase() === "EGYPT"
          ? "EGY"
          : addressDoc.country || "EGY",
      postal_code: addressDoc.zipcode?.toString() || "00000",
    };
    console.log("DEBUG: Billing Data:", billingData);

    const paymentKey = await getPaymentKey(
      authToken,
      amount,
      paymobAppointmentId,
      billingData,
      process.env.PAYMOB_INTEGRATION_ID,
      origin
    );
    console.log("DEBUG: Payment Key:", paymentKey);

    const paymentUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
    console.log("DEBUG: Payment URL:", paymentUrl);

    return res.json({ success: true, url: paymentUrl });
  } catch (error) {
    console.error("DEBUG: placeOrderPaymob Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return res.json({ success: false, message: error.message });
  }
};

// API to get doctors by specialty
const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.query;
    const doctors = await doctorModel
      .find({ specialty: new RegExp(specialty, "i"), available: true })
      .select("name specialty fees");
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Hello ${user.name},\n\nYour OTP is: ${otp}\n\nVerify your account within 24 hours.\n\n– Kamma-Pharma Team`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending verification OTP:", error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.json({ success: false, message: error.message });
  }
};

// reset password
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hello ${user.name},\n\nYour OTP is: ${otp}\n\nReset your password within 15 minutes.\n\n– Kamma-Pharma Team`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error sending reset OTP:", error);
    res.json({ success: false, message: error.message });
  }
};

// reset user password
export const resetPassword = async (req, res) => {
  const { userId, otp, newPassword } = req.body;
  if (!userId || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "User ID, OTP, and new password are required",
    });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  placeOrderStripe,
  placeOrderPaymob,
  payAppointmentStripe,
  payAppointmentPaymob,
  uploadAudio,
  uploadFile,
  analyzeImage,
  analyzePdfText,
  getDoctorsBySpecialty,
  getChatResponse,
};
