import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";
import doctorModel from "../models/doctorModel.js";
import labModel from "../models/labModel.js";

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

export { appointmentsAdmin, appointmentCancel };