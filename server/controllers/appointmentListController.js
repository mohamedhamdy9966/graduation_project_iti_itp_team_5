import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";

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

export { listAppointment };