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
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ success: false, message: "Google token is required" });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return res.json({ success: false, message: "Invalid Google token" });
    }

    // Check if user already exists
    let user = await userModel.findOne({ email });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.image = picture || user.image;
        await user.save();
      }

      // Generate JWT token
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      return res.json({
        success: true,
        token: jwtToken,
        message: "Login successful",
        isNewUser: false,
      });
    } else {
      // New user, create account
      const userData = {
        name,
        email,
        googleId,
        image:
          picture ||
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAA5uSURBVHgB7d0JchvHFcbxN+C+iaQolmzFsaWqHMA5QXID+wZJTmDnBLZu4BvER4hvYJ/AvoHlimPZRUngvoAg4PkwGJOiuGCd6df9/1UhoJZYJIBvXndPL5ndofljd8NW7bP8y79bZk+tmz8ATFdmu3nWfuiYfdNo2383389e3P5Xb9B82X1qs/YfU3AB1Cuzr+3cnt8U5Mb132i+7n5mc/a9EV4gDF37Z15Qv3/9a/fz63/0VgXOw/uFdexLAxCqLze3s+flL/4IcK/yduwrAxC0zoX9e+u9rJfVXoB7fV41m7u2YQBCt2tt+6v6xEUfeM6+ILyAGxv9QWbL+iPOPxoAX2Zts9GZtU8NgDudln3eyNvQnxgAd/Lw/k194I8NgD+ZPc2aO92uAXCpYQDcIsCAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGOzBlfanfzRNrvo5o8Ls46eO8VDut3i966babz7rMfcjFmWP8/rOTM4Q4ADpjCenZu18sCe52FtX9wczkGUAS+fb6IwK9Tzc/kHI/96gU9H8HiLAnOWh/WsZXZ6fnfYpkEXCT30b0sjr8jz+SdkYb4I8wwdruAQ4AAotCdnRbUdtcJOg74XhbkMtCr08iJhDgkBrkmv0uWV9vgsrNDeRd/z3lHxtSrz0kIe6HlDjQhwxVRtD0+Kfq1n+v5b/Z9lKQ/x8gJVuQ5Zc6fr5PrvWyzBvYuCvLZEkKtEBZ6yFIJbOmkVD4JcHQI8JSkF9zqFWANyalYryJgeAjxh6pAc5ME9OrOkaWDu8LQI8+oSg13TQoAnSKPKe8d+RpWroHvZGrlundOsngYCPAGqurtHl/dL8S5VYnUnqMaTRYDHpL6uKkzVs6Y8Kqux5nKrGjP3enwEeAwHp8VAFYaj8QG1VrbWaFKPi5dvBGoyvz4gvONQNX61X4wbYHQEeEj64O3sp3l7aNI02Nc8KkftMRqa0EPQXODmIf3dSdPtJrVqHiwbhkQFHpDC++aA8E6L+sW7R4YhUYEHcNy6XIWD6dGtJm1aoMEtRqgHQwW+B+Gtllo6GiBkic1gCPAdrq5/RXX0utOcHgwBvkXZ50U9dJ+YEN+PAN9AA1UabWZOc73UJ+YW090I8DXlJA1Gm8OgW0xHp4ZbEOBrdpnXHJz9RNdVD4IAX6G5zawoChMX1psR4L5yBw2ESeFlUOtdBNgul7khbGpG0x9+GwG2YqST5pkP6g9rthYKyQdYG6ufsKTNFZrSl5IOsKruIU0ydzTJhvvDhaQDTNPZL7WceO8SDrDefJrOfnW6NKUl2eWEmioZi0b/TN/FhfwN7Z8c2Ji5/PPz/qmHZ6f9s4Yjudddns80n/Ci2CR/dDW/zp2PZCq0G+tmaytFcBtDtKUU4OO8+7C3n9+Wcd6XVDdI64dTlWSAPQ9cKahbm2YPN4YL7VVzebVe1+NBEeadN0WYPUq9Cid3OqGqr05P8OhhHtzth6MH9y4KsILssXmt8KZahZMbxPJafR9v549H0wmvqBp/9KeiOntTVuEUJRVgzXf2eOtB4VWTedoU3mcf+gxxqveFkwqwx8UKj7aqCW9JI9iqxA1nn4xUq3AyAVbl9fYGqxKqz1vHv/vkPXMnxYUOyQTYYxPryWOrjW5PrTg7nFsX6NR2s0wmwN6q7/JS8aiTmu+eaLJKcWIHqycRYI+DVxsPrHa6gHjrC6e2o0oSAT5xeFVeDuScoBAuJMNoOb3TMKo0KrCzq/LCQj6QFMjMolAuJMNI6cjS6AOs5rO3/Z1Dmha4OG/upNSMjj/ADq/GqsCh0C0lj/eEUxmNjj7AHm/uhzYTambG3EllrXfUAdZghsdlgzNsNTi2VDa+i/qjcs5u/hPhcaleKtMqow6w1zcxtNsgHl9HtbxS6AfHXYGdNqM6gX3fF05fR++7rgwi6gB77QeF1PRXa6DjdGJECl2oaAOsq6/X831D2hXjzPHcYiqwY54P5z4OaOXUqeMleimMREcbYM9vnpqtoYT40PHeyynMiY42wF4HXkpHAWy8p6a8521n1QqLfSQ63gA7v/o2d6123veMFs9dqUHQBw5U70DrmvdqfvXG3Iu9GR1tgGNoOtUZIF08YjiCJfaBLCpwwBSgN02rnO77xlB9U0AFDpyCVPWEhJ3X8RyAxiCWU7EMXqgP9/Mv1c2GUsV/E8AA2qQwiIXanZ6Z/bpjU6d/57dXBkcSPlnVl/L0wGntFa2JI//7xeAMAXZEIdbc5A+eTHbTOzWbqbw+0YR2Rs1cn36ezD1iDVTpv0V4/Yq2Amtbmlhv4it4L38rRqgfPRx+72YNiL3uD1Z5XSo4qNi3J6IJ7djVIOsUhbXVYvub67taKqT6u4fHxeKEkFY7YTzRBriR5RXY0qBw7p1fDnRJubOlFnXEXmXvMutwR81hRN2ETmFB921imYiBu0XbQ8gyA6LvA0f747G3MoQAO0WAMRd5/1ei/ZiHcrof6pNCNyrqQayUXD1P6aaTFMrN2VMalU6hAkd9GymmyRwKqI76nMsfC/PFgWOLC8XPOMrpgVqiqJHq3vlRrWLE/uw0jm10SguBHRI3DVE3NFWJvJ5Sp8BqYoYmaKwsTf6IT3Ux/uhmrLz9Z5queXxcTPg4cLwrZQqtsKgDPOcswArp1qbZ+oN6+/Cq7Ho83Cx+rRDv7fkKs1pgsU/ikOgrsAeqsttbxXOI1laKR2+LHwX5MPyJIimEV+KuwDPFlTjUXRlU5R5vhxvc69Ssf/wor8zrRZDr2K9rUIsJ9H8l+pstuhKHeDymKq5WEnl0Ncg//T/MapzCAJZE383XyG1I9OF/9qHf8F6ln+UvTy/7yqHQ4FUqTejoA7wUUID1gf/og6LpHBNVY7UoQuFl7GMSog+w+sAhvKFleGOdIaYWRSghDumiPW1JzFeaD6A/FHN4Swrx+pC7g0yams+p9H8liQCv1NxkfbSVztxsjarP1RiglJrPkkSA62xG68O8HcGA1aBUAev8eZcjG1+4TzJT/lcWrRYphbfUm0lWQxXWxYMKHCm9sY2Kl5fpA1V3n7AuG2tWuTUnE2ImKZkAK7zLFVdhLzOspqHqC1eK1VeSWjWrwawqq3DKAVYTulHhp0vhTXEXlqR+5KqrcOynw9+l6k0DUmw+S3LXrCqrsDZc11m7qSmPbKkqxJq4keoeaMn1GsoqfFjRzhMKsdbR/vlJ/PeC6zqyJdXqK1lzJ/YzzN+l5YU7e9UvM1SfWIM7G5GNTNd51pJaVA+WLVlJBlgOTqurwtdpgKc8y2ga2+VUQcec7h8W2+7UddaSms1ba2lvIZxsgFV9X+2HMdCk1Uk6kEyb1S0tFr8OKdTaAE/7ZLVaZicnxcZ3IexsubGS1sKFmyS7e7L6wvoAvD6w2ikcelylACvIWogxO1v8er4/WNPbiXJm/D61QqgLWOeieG6dF9vOti/6O1W2i98LcRtavQaph1eS3v5c9w619cppgDtKKDTDNE8HnboYy77QWzXM9ApR8ucXrOdVuFXDgNakpXQa4doiR+eUkn8Z1JReXzE4oeCuJnzb6DquY1Y0o+teM4z76WJL0/ltBLhPV3WaZWHjPXoXL0dfeXWveskhBqMWEq2kdxHgK3R1T3lWT6i0QT/vy80I8DW6t5jy3NrQ6KK6uWq4BQG+weoizbUQlN0a+r2346W5hZpszPSpj8L7kPDei5fnDppqmcIp7yFa57UfCAG+h6oAH6Rq6cKZyumC4yLA9yibcnygpk+vtQas6LoMjgAPgA/W9HGhHA0BHoKadtximjwNVD16QFdlFMmvRhqWbjFlebXYPzZMgEKr1g2jzaMhwCPQPWKtJW4epr117Lj0OqpFkzF9dWRc90akyqFJBimeBjAu9Xd1n10PwjseAjyGclM1+sWD04VP/V1muk0G9WMC1C/WCLX216JJfTtd6FZrOiUyVsnuSjkth6dmBzVtsxoqdTPUXGaUefKowBNWVmOF+KRlSVNfV4vwaS5PDwGeAvWNe9MB54vbTak1qxXclf6KLgapposAT5FmFS2uF5VYFTn2IBPc6hHgCqhJrYeCfKwTDtoWFYJbHwJcoTLICrCC7L2PrEEpdRMIbn0IcA00KquHbquUYfZSlVVtdRFScJnEUj/eghqV5/voof6xjng5bYUX5quhVdWl2oaD+8AB0jty1i7C3Dto7MIqpcD2WglzRWCptOHirQmQKlxvBLu/NlaBPu8HuXdaYLcI9iTOc1IrQCEtnxVaVgb5QQV2TO9cu1M8K8xdHRVqN58+ONsPZVYeT5oR1BhQgR1TpWZ6Ytq4BgOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDhGgAHHCDDgGAEGHCPAgGMEGHCMAAOOEWDAMQIMOEaAAccIMOAYAQYcI8CAYwQYcIwAA44RYMAxAgw4RoABxwgw4BgBBhwjwIBjBBhwjAADjhFgwDECDDjWsMxeGACPdhvWJcCAUz80OmbfGQB3Ohf2TdZsdjesbU0D4EvbnjU2N7Pd/MtvDYAfmX29+X72ohiFbtu/8v/dNQAe7Nq5PdcXvQAryfnTcwPgwfN+Zi/vA29uZ18ZIQbC1snDW2S1J7v+582d7uf50xf5Y8MAhEJd3LfCK9lNf7P5svu0M2NfNjL7hwGo27capyqbzVdld/2/FGSbtU/zLz/JHx8bVRmYPs2OLCZYfWeH9tXms+zWAebfASz7TK2tFnyYAAAAAElFTkSuQmCC",
        mobile: "", // Will be set during profile completion
        password: "", // No password for Google users
        bloodType: "",
        medicalInsurance: "",
        gender: "",
        birthDate: "",
        allergy: {},
        address: { line1: "", line2: "" },
        isAccountVerified: true, // Google users are pre-verified
        verifyOtp: "",
        verifyOtpExpireAt: 0,
        isGoogleUser: true, // Flag to identify Google users
      };

      const newUser = new userModel(userData);
      await newUser.save();

      const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

      return res.json({
        success: true,
        token: jwtToken,
        message: "Account created successfully with Google",
        isNewUser: true,
        needsProfileCompletion: true,
      });
    }
  } catch (error) {
    console.error("Google auth error:", error);
    res.json({
      success: false,
      message: "Google authentication failed. Please try again.",
    });
  }
};

const appleAuth = async (req, res) => {
  try {
    const { identityToken, authorizationCode, user } = req.body;

    if (!identityToken) {
      return res.json({
        success: false,
        message: "Apple identity token is required",
      });
    }

    console.log("Apple auth request received:", {
      hasIdentityToken: !!identityToken,
      hasAuthCode: !!authorizationCode,
      hasUserData: !!user,
    });

    // Verify the identity token with Apple
    let appleUser;
    try {
      appleUser = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID,
        issuer: "https://appleid.apple.com",
        // Add these for web applications
        ignoreExpiration: false,
        nonce: undefined, // You can implement nonce validation for extra security
      });
    } catch (verifyError) {
      console.error("Apple token verification failed:", verifyError);
      return res.json({
        success: false,
        message: "Invalid Apple identity token",
      });
    }

    console.log("Apple user verified:", {
      sub: appleUser.sub,
      email: appleUser.email,
      email_verified: appleUser.email_verified,
    });

    // Extract user information
    const appleId = appleUser.sub;
    const email = appleUser.email;
    const emailVerified =
      appleUser.email_verified === "true" || appleUser.email_verified === true;

    // Get name from user object if provided (only available on first sign-in)
    let firstName = "";
    let lastName = "";
    let fullName = "";

    if (user && user.name) {
      firstName = user.name.firstName || "";
      lastName = user.name.lastName || "";
      fullName = `${firstName} ${lastName}`.trim();
    }

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required for account creation",
      });
    }

    // Check if user already exists
    let existingUser = await userModel.findOne({
      $or: [{ email: email }, { appleId: appleId }],
    });

    if (existingUser) {
      // User exists, update Apple info if needed
      let needsUpdate = false;

      if (!existingUser.appleId) {
        existingUser.appleId = appleId;
        needsUpdate = true;
      }

      if (!existingUser.isAppleUser) {
        existingUser.isAppleUser = true;
        needsUpdate = true;
      }

      // Update name if we have it and user doesn't have one
      if (
        fullName &&
        (!existingUser.name || existingUser.name === "Apple User")
      ) {
        existingUser.name = fullName;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await existingUser.save();
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_SECRET
      );

      return res.json({
        success: true,
        token: jwtToken,
        message: "Login successful",
        isNewUser: false,
      });
    } else {
      // New user, create account
      const userData = {
        name: fullName || "Apple User", // Fallback name
        email,
        appleId,
        mobile: "", // Will be set during profile completion
        password: "", // No password for Apple users
        bloodType: "",
        medicalInsurance: "",
        gender: "",
        birthDate: "",
        allergy: {},
        address: { line1: "", line2: "" },
        isAccountVerified: emailVerified, // Apple emails are pre-verified
        verifyOtp: "",
        verifyOtpExpireAt: 0,
        isAppleUser: true, // Flag to identify Apple users
        image:
          "data:image/png;base64,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",
      };

      const newUser = new userModel(userData);
      await newUser.save();

      const jwtToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

      return res.json({
        success: true,
        token: jwtToken,
        message: "Account created successfully with Apple ID",
        isNewUser: true,
        needsProfileCompletion: true,
      });
    }
  } catch (error) {
    console.error("Apple auth error:", error);
    res.json({
      success: false,
      message: "Apple authentication failed. Please try again.",
    });
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

    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 10MB limit.",
      });
    }

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

    console.log("Uploading to Cloudinary...");
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "video",
            folder: "roshetta/audio",
            timeout: 60000,
            format: "webm",
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

    // === Whisper transcription with exponential backoff retry ===
    console.log("Starting transcription...");
    let transcription = "";
    let transcriptionSuccess = false;

    const transcribeWithRetry = async (
      maxRetries = 3,
      initialDelayMs = 5000
    ) => {
      let attempt = 0;
      let delay = initialDelayMs;

      while (attempt < maxRetries) {
        try {
          attempt++;
          console.log(`Whisper transcription attempt ${attempt}...`);

          const formData = new FormData();
          formData.append("file", req.file.buffer, {
            filename: req.file.originalname || "audio.webm",
            contentType: req.file.mimetype || "audio/webm",
          });
          formData.append("model", "whisper-1");
          formData.append("language", "en");
          formData.append("response_format", "json");

          const transcriptionResponse = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            formData,
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                ...formData.getHeaders(),
              },
              timeout: 60000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            }
          );

          if (transcriptionResponse.data?.text) {
            return transcriptionResponse.data.text.trim();
          } else {
            throw new Error("Empty transcription response");
          }
        } catch (err) {
          if (err.response?.status === 429) {
            console.warn(
              `429 Too Many Requests - retrying in ${
                delay / 1000
              }s... (attempt ${attempt})`
            );
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2; // Exponential backoff
          } else {
            throw err;
          }
        }
      }
      throw new Error(
        "Too many requests to transcription API. Please try again later."
      );
    };

    try {
      transcription = await transcribeWithRetry();
      console.log("Transcription successful:", transcription);

      if (transcription.length < 2) {
        transcription =
          "Audio was too short or unclear. Please try speaking more clearly or for a longer duration.";
        transcriptionSuccess = false;
      } else {
        transcriptionSuccess = true;
      }
    } catch (err) {
      console.error("Final transcription error:", err.message);
      transcription = err.message || "Transcription failed.";
      transcriptionSuccess = false;
    }

    // Save in DB
    try {
      const fileData = {
        type: "audio",
        url: cloudinaryResult.secure_url,
        transcription,
        transcriptionSuccess,
        createdAt: new Date(),
      };

      if (req.userId) {
        console.log("Saving to authenticated user:", req.userId);
        await userModel.findByIdAndUpdate(req.userId, {
          $push: { uploadedFiles: fileData },
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
    }

    console.log("Upload audio completed", {
      transcriptionSuccess,
      transcriptionLength: transcription.length,
    });

    res.status(200).json({
      success: true,
      transcription,
      transcriptionSuccess,
      fileUrl: cloudinaryResult.secure_url,
      message: transcriptionSuccess
        ? "Audio uploaded and transcribed successfully"
        : "Audio uploaded but transcription failed",
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
// API to update user profile
const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("File present:", !!req.file);

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

    const imageFile = req.file; // Changed variable name for clarity

    console.log("Parsed data:", {
      userId,
      name,
      phone,
      address: typeof address === "string" ? "JSON string" : typeof address,
      birthDate,
      gender,
      medicalInsurance,
      allergy: typeof allergy === "string" ? "JSON string" : typeof allergy,
      hasImage: !!imageFile,
    });

    // Validation
    if (!name || !phone || !birthDate || !gender || !medicalInsurance) {
      console.log("Validation failed - missing required fields");
      return res.json({ success: false, message: "Data Missing" });
    }

    // Parse JSON strings
    let parsedAddress, parsedAllergy;
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
      parsedAllergy =
        typeof allergy === "string" ? JSON.parse(allergy) : allergy || {};
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.json({
        success: false,
        message: "Invalid JSON format in address or allergy data",
      });
    }

    // Update user data
    const updateData = {
      name,
      mobile: phone, // Note: using 'mobile' to match your schema
      address: parsedAddress,
      birthDate,
      gender,
      medicalInsurance,
      allergy: parsedAllergy,
    };

    console.log("Updating user with data:", updateData);

    await userModel.findByIdAndUpdate(userId, updateData);

    // Handle image upload if present
    if (imageFile) {
      console.log("Processing image upload");
      console.log("Image file details:", {
        originalname: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
      });

      try {
        // Upload to Cloudinary using buffer (since we're using memory storage)
        const imageUpload = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "user_profiles", // Optional: organize uploads
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
            .end(imageFile.buffer);
        });

        const imageURL = imageUpload.secure_url;

        // Update user with new image URL
        await userModel.findByIdAndUpdate(userId, { image: imageURL });
        console.log("User image updated successfully");
      } catch (imageError) {
        console.error("Image upload error:", imageError);
        // Don't fail the entire request if only image upload fails
        return res.json({
          success: false,
          message: `Profile updated but image upload failed: ${imageError.message}`,
        });
      }
    }

    console.log("Profile update completed successfully");
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    console.error("Error stack:", error.stack);
    res.json({ success: false, message: `Update failed: ${error.message}` });
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
  googleAuth,
  appleAuth,
};
