import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import labRouter from "./routes/labRoute.js";
import { paymobWebhook } from "./webhooks/paymobWebhooks.js";
import { stripeWebhooks } from "./webhooks/stripeWebhooks.js";
import rateLimit from "express-rate-limit";
import cleanupTempFiles from "./cleanup.js";
import session from "express-session";

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Rate limiting for sensitive authenticated endpoints
const authApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit to 10 requests per minute per IP
  message: {
    success: false,
    message: "Too many requests, please try again after a minute.",
  },
});

// Rate limiting for public upload endpoints
const publicUploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1, // Limit to 1 upload per minute per IP
  message: {
    success: false,
    message: "Too many uploads, please try again after a minute.",
  },
});

// Rate limiting for public API endpoints
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 requests per 15 minutes per IP
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes.",
  },
});

// Apply rate limiting to specific routes
app.use("/api/user/book-appointment", authApiLimiter);
app.use("/api/user/pay-appointment-stripe", authApiLimiter);
app.use("/api/user/pay-appointment-paymob", authApiLimiter);
app.use("/api/user/upload-audio-public", publicUploadLimiter);
app.use("/api/user/upload-file-public", publicUploadLimiter);
app.use("/api/user/chatbot-context", publicApiLimiter);
app.use("/api/user/doctors-by-specialty", publicApiLimiter);

// Webhook routes (must be before express.json() to handle raw body)
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.post("/paymob-webhook", express.json(), paymobWebhook);

// middlewares
app.use(express.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "http://localhost:5174"
        : "http://localhost:5173",
    credentials: true,
  })
);

// api Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/lab", labRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Api Working");
});

app.listen(port, () => console.log("Server Started", port));
