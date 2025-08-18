import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import labModel from "../models/labModel.js";

// API for adding lab
const addLab = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
      services,
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
      !services ||
      !mobile ||
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

    // Check if lab already exists
    const existingLab = await labModel.findOne({ email });
    if (existingLab) {
      return res.json({
        success: false,
        message: "Lab with this email already exists",
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

    // Parse services - handle both string and array
    let parsedServices = [];
    if (typeof services === "string") {
      try {
        parsedServices = JSON.parse(services);
      } catch {
        parsedServices = [services];
      }
    } else if (Array.isArray(services)) {
      parsedServices = services;
    }

    const labData = {
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      image: imageUrl,
      services: parsedServices,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newLab = new labModel(labData);
    await newLab.save();

    console.log("Lab added successfully:", newLab.name);
    res.json({ success: true, message: "Lab Added" });
  } catch (error) {
    console.log("Add lab error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all labs
const allLabs = async (req, res) => {
  try {
    const labs = await labModel.find({}).select("-password");
    console.log("Labs found:", labs.length);
    res.json({ success: true, labs });
  } catch (error) {
    console.log("Error fetching labs:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to change lab availability
const changeLabAvailability = async (req, res) => {
  try {
    const { labId } = req.body;

    if (!labId) {
      return res.json({ success: false, message: "Lab ID is required" });
    }

    const labData = await labModel.findById(labId);
    if (!labData) {
      return res.json({ success: false, message: "Lab not found" });
    }

    await labModel.findByIdAndUpdate(labId, {
      available: !labData.available,
    });

    res.json({
      success: true,
      message: "Lab availability changed successfully",
    });
  } catch (error) {
    console.error("Error changing lab availability:", error);
    res.json({ success: false, message: error.message });
  }
};

export { addLab, allLabs, changeLabAvailability };