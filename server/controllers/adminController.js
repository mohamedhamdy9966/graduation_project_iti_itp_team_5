import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import userModel from "../models/userModel.js";
import labModel from "../models/labModel.js";

// API for adding doctor
const addLab = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
      specialty,
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

    // Check if doctor already exists
    const existingLab = await labModel.findOne({ email });
    if (existingLab) {
      return res.json({
        success: false,
        message: "Lab with this email already exists",
      });
    }

    // Hash password (only once!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      image: imageUrl,
      specialty,
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

    // Hash password (only once!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

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

    console.log("Doctor added successfully:", newDoctor.name); // Debug log
    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log("Add doctor error:", error); // Debug log
    res.json({ success: false, message: error.message });
  }
};

// api for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "invalid credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api to get all doctors
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// api to get all doctors
const allLabs = async (req, res) => {
  try {
    const labs = await labModel.find({}).select("-password");
    res.json({ success: true, labs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentDoctorModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentDoctorModel.findById(
      appointmentId
    );
    // verify appointment user

    await appointmentDoctorModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor
    const { docId, labId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    const labData = await labModelModel.findById(labId);

    let slotsBooked = doctorData.slotsBooked;
    let slotsBooked1 = doctorData.slotsBooked;

    slotsBooked[slotDate] = slotsBooked[slotDate].filter((e) => e !== slotTime);
    slotsBooked1[slotDate] = slotsBooked1[slotDate].filter((e) => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
    await labModel.findByIdAndUpdate(labId, { slotsBooked1 });
    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to Get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentDoctorModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  addLab,
  loginAdmin,
  allDoctors,
  allLabs,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
