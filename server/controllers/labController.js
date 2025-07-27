import labModel from "../models/labModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentLabModel from "../models/appointmentDoctorModel.js";

const changeLabAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await labModel.findById(docId);
    await labModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const labList = async (req, res) => {
  try {
    const labs = await labModel
      .find({})
      .select(
        "name email mobile image specialty degree experience about available fees address date slotsBooked"
      );
    res.json({ success: true, labs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API for lab login
const loginLab = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email); // Debug log

    const lab = await labModel.findOne({ email });
    if (!lab) {
      return res.json({ success: false, message: "lab not found" });
    }

    console.log("lab found:", lab.name); // Debug log

    const isMatch = await bcrypt.compare(password, lab.password);
    console.log("Password match:", isMatch); // Debug log

    if (isMatch) {
      const token = jwt.sign({ id: lab._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.log("Login error:", error);
    res.json({ success: false, message: error.message });
  }
};

// API to get lab appointments for lab panel
const appointmentsLab = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentLabModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to mark appointment completed for lab panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentLabModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentLabModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to cancel appointment completed for lab panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentLabModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentLabModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for lab panel
const labDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentLabModel.find({ docId });
    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });
    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });
    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get lab profile for lab panel
const labProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await labModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to update lab profile data from lab panel
const updateLabProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;
    await labModel.findByIdAndUpdate(docId, { fees, address, available });
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  changeLabAvailability,
  labList,
  loginLab,
  appointmentsLab,
  appointmentCancel,
  appointmentComplete,
  labDashboard,
  labProfile,
  updateLabProfile,
};
