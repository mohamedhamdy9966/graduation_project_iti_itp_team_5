import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import doctorModel from "../models/doctorModel.js";

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
      allergy,
    } = req.body;
    if (
      !name ||
      !password ||
      !email ||
      !mobile ||
      !bloodType ||
      !medicalInsurance ||
      !gender
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

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      mobile,
      password: hashedPassword,
      bloodType,
      medicalInsurance,
      gender,
      allergy: allergy || {}, // Ensure allergy is an object
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
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
      dob,
      gender,
      medicalInsurance,
      allergy,
    } = req.body;
    const imageProfile = req.file;
    if (!name || !phone || !dob || !gender || !medicalInsurance) {
      return res.json({ success: false, message: "Data Missing" });
    }
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
      medicalInsurance,
      allergy: JSON.parse(allergy) || {}, // Parse allergy or default to empty object
    });
    if (imageProfile) {
      // Upload image to Cloudinary
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
    const userId = req.userId; // Use userId from authUser middleware
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }
    let slotsBooked = docData.slotsBooked;
    // Checking for slot availability
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
    // Save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get user appointments for frontend my appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId; // Use userId from authUser middleware
    const appointments = await appointmentDoctorModel.find({
      userId: userId.toString(),
    });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment
// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId; // Use userId from authUser middleware
    const appointmentData = await appointmentDoctorModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment Not Found" });
    }
    // Verify appointment user
    if (appointmentData.userId !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }
    await appointmentDoctorModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    let slotsBooked = doctorData.slotsBooked;
    slotsBooked[slotDate] = slotsBooked[slotDate].filter((e) => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
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
};
