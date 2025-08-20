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
import DrugRouter from "./routes/DrugRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import MongoStore from "connect-mongo";

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Session middleware with MongoStore
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,  // Use your MongoDB connection string
      ttl: 1 * 24 * 60 * 60,  // Session TTL (e.g., 1 day in seconds)
      autoRemove: 'native'  // Automatically remove expired sessions
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 14 * 24 * 60 * 60 * 1000  // Match TTL in milliseconds
    },
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
  max: 3, // More reasonable limit
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
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://graduation-project-iti-itp-team-5-u.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// api Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/lab", labRouter);
app.use("/api/user", userRouter);
app.use("/api/drug", DrugRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("Api Working");
});

app.listen(port, () => console.log("Server Started", port));
