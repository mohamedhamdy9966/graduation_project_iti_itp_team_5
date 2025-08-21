import express from "express";
import {
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
  isAuth,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
  getChatResponse,
  googleAuth,
  appleAuth
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import doctorModel from "../models/doctorModel.js";
import labModel from "../models/labModel.js";

const userRouter = express.Router();

// Existing routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-auth", googleAuth);
userRouter.post("/apple-auth", appleAuth);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.post("/send-verify-otp", authUser, sendVerifyOtp);
userRouter.post("/verify-account", verifyEmail);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.post(
  "/update-profile",
  upload.single("imageProfile"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/pay-appointment-stripe", authUser, payAppointmentStripe);
userRouter.post("/pay-appointment-paymob", authUser, payAppointmentPaymob);
userRouter.post("/stripe", authUser, placeOrderStripe);
userRouter.post("/paymob", authUser, placeOrderPaymob);

// Chatbot context endpoint
userRouter.get("/chatbot-context", async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ available: true })
      .select("name specialty fees");
    const labs = await labModel
      .find({ available: true })
      .select("name services");
    res.json({
      success: true,
      context: {
        doctors: doctors.map((doc) => ({
          name: doc.name,
          specialty: doc.specialty,
          fees: doc.fees,
        })),
        labs: labs.map((lab) => ({
          name: lab.name,
          services: lab.services,
        })),
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Audio and file upload endpoints
userRouter.post("/upload-audio", authUser, upload.single("audio"), uploadAudio); // ADD THIS LINE
userRouter.post("/upload-audio-public", upload.single("audio"), uploadAudio);
userRouter.post("/upload-file", authUser, upload.single("file"), uploadFile); // ADD THIS LINE
userRouter.post("/upload-file-public", upload.single("file"), uploadFile);

// Analysis endpoints
userRouter.post("/analyze-image", authUser, analyzeImage);
userRouter.post("/analyze-pdf", upload.single("file"), analyzePdfText);
userRouter.post("/analyze-text", getChatResponse);
userRouter.get("/doctors-by-specialty", getDoctorsBySpecialty);

userRouter.get("/debug-doctors", async (req, res) => {
  try {
    console.log("=== DEBUGGING DOCTORS ===");

    // Check all doctors
    const allDoctors = await doctorModel
      .find({})
      .select("name specialty fees available");
    console.log("All doctors in database:", allDoctors);

    // Check available doctors
    const availableDoctors = await doctorModel
      .find({ available: true })
      .select("name specialty fees");
    console.log("Available doctors:", availableDoctors);

    // Look for Dr. Nour specifically
    const drNour = await doctorModel
      .find({
        name: { $regex: /nour/i },
      })
      .select("name specialty fees available");
    console.log("Doctors with 'Nour' in name:", drNour);

    res.json({
      success: true,
      allDoctors: allDoctors.length,
      availableDoctors: availableDoctors.length,
      drNourResults: drNour,
      data: {
        all: allDoctors,
        available: availableDoctors,
        nour: drNour,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.json({ success: false, message: error.message });
  }
});

// Also add this to test the system prompt generation
userRouter.get("/debug-system-prompt", async (req, res) => {
  try {
    const systemPrompt = await getSystemPrompt("", null);
    console.log("Generated system prompt:", systemPrompt);

    res.json({
      success: true,
      promptLength: systemPrompt.length,
      prompt: systemPrompt,
    });
  } catch (error) {
    console.error("System prompt debug error:", error);
    res.json({ success: false, message: error.message });
  }
});

// Debug route - REMOVE IN PRODUCTION
userRouter.get("/debug-openai", async (req, res) => {
  try {
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    console.log("API Key prefix:", process.env.OPENAI_API_KEY?.substring(0, 7));
    
    // Test basic OpenAI connection
    const testResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    res.json({
      success: true,
      message: "OpenAI API connection successful",
      response: testResponse.data
    });
  } catch (error) {
    res.json({
      success: false,
      message: "OpenAI API connection failed",
      error: error.response?.data || error.message
    });
  }
});

// Add to userRoute.js for testing
userRouter.post("/test-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }
    
    console.log("Test file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "test.webm",
      contentType: req.file.mimetype,
    });
    formData.append("model", "whisper-1");
    
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
        timeout: 30000,
      }
    );
    
    res.json({
      success: true,
      transcription: response.data.text,
      originalResponse: response.data
    });
    
  } catch (error) {
    console.error("Test error:", error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

export default userRouter;
