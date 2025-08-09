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
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";
import doctorModel from "../models/doctorModel.js";
import labModel from "../models/labModel.js";

const userRouter = express.Router();

// Existing routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.get("/is-auth", authUser, isAuth);
userRouter.post("/send-verify-otp", authUser, sendVerifyOtp);
userRouter.post("/verify-account", verifyEmail);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.post(
  "/update-profile",
  upload.single("image"),
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

export default userRouter;
