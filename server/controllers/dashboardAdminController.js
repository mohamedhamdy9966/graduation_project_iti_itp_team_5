import doctorModel from "../models/doctorModel.js";
import labModel from "../models/labModel.js";
import userModel from "../models/userModel.js";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";

// API to get dashboard data for admin panel
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

export { adminDashboard };