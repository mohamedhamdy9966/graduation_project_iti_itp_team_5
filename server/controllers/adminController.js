import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import userModel from "../models/userModel.js";
import labModel from "../models/labModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";

// API for adding lab
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

    // Check if lab already exists
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

    // Upload image to cloudinary or use default
    let imageUrl = "https://via.placeholder.com/150"; // Default image URL
    if (imageFile) {
      const base64String = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;
      const imageUpload = await cloudinary.uploader.upload(base64String, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }

    const labData = {
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

    // Upload image to cloudinary or use default
    let imageUrl = "https://via.placeholder.com/150"; // Default image URL
    if (imageFile) {
      const base64String = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;
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

// api to get all labs
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
    const doctorAppointments = await appointmentDoctorModel.find({}).lean();
    const labAppointments = await appointmentLabModel.find({}).lean();

    // Add type field to distinguish appointment types
    const appointments = [
      ...doctorAppointments.map((appt) => ({ ...appt, type: "doctor" })),
      ...labAppointments.map((appt) => ({ ...appt, type: "lab" })),
    ];

    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId, type } = req.body;

    if (!appointmentId || !type) {
      return res.json({
        success: false,
        message: "Missing appointment ID or type",
      });
    }

    if (type === "doctor") {
      const appointmentData = await appointmentDoctorModel.findById(
        appointmentId
      );
      if (!appointmentData) {
        return res.json({
          success: false,
          message: "Doctor appointment not found",
        });
      }

      await appointmentDoctorModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      const { docId, slotDate, slotTime } = appointmentData;
      if (docId) {
        const doctorData = await doctorModel.findById(docId);
        if (doctorData) {
          let slotsBooked = doctorData.slotsBooked;
          slotsBooked[slotDate] = slotsBooked[slotDate].filter(
            (e) => e !== slotTime
          );
          await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
        }
      }
    } else if (type === "lab") {
      const appointmentData = await appointmentLabModel.findById(appointmentId);
      if (!appointmentData) {
        return res.json({
          success: false,
          message: "Lab appointment not found",
        });
      }

      await appointmentLabModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      const { labId, slotDate, slotTime } = appointmentData;
      if (labId) {
        const labData = await labModel.findById(labId);
        if (labData) {
          let slotsBooked = labData.slotsBooked;
          slotsBooked[slotDate] = slotsBooked[slotDate].filter(
            (e) => e !== slotTime
          );
          await labModel.findByIdAndUpdate(labId, { slotsBooked });
        }
      }
    } else {
      return res.json({ success: false, message: "Invalid appointment type" });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to Get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const labs = await labModel.find({});
    const users = await userModel.find({});
    const doctorAppointments = await appointmentDoctorModel.find({});
    const labAppointments = await appointmentLabModel.find({});

    const dashData = {
      doctors: doctors.length,
      labs: labs.length,
      appointments: doctorAppointments.length + labAppointments.length,
      patients: users.length,
      latestAppointments: [
        ...doctorAppointments.map((appt) => ({
          ...appt.toObject(),
          type: "doctor",
        })),
        ...labAppointments.map((appt) => ({ ...appt.toObject(), type: "lab" })),
      ]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

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

// Export these functions along with your existing exports
export {
  addDoctor,
  addLab,
  loginAdmin,
  allDoctors,
  allLabs,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  changeDoctorAvailability, // Add this
  changeLabAvailability, // Add this
};
