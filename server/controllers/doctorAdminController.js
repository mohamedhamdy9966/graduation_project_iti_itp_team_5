import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
      specialty,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // Check if all required fields are provided
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !specialty ||
      !degree ||
      !mobile ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please Enter a valid Email",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Check if doctor already exists
    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.json({
        success: false,
        message: "Doctor with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to cloudinary or use default
    let imageUrl = "https://via.placeholder.com/150";
    if (imageFile) {
      const base64String = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
      const imageUpload = await cloudinary.uploader.upload(base64String, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }

    const doctorData = {
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      image: imageUrl,
      specialty,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    console.log("Doctor added successfully:", newDoctor.name);
    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log("Add doctor error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to change doctor availability
const changeDoctorAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.json({ success: false, message: "Doctor ID is required" });
    }

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    res.json({
      success: true,
      message: "Doctor availability changed successfully",
    });
  } catch (error) {
    console.error("Error changing doctor availability:", error);
    res.json({ success: false, message: error.message });
  }
};

export { addDoctor, allDoctors, changeDoctorAvailability };