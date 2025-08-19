import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";
import doctorModel from "../models/doctorModel.js";
import labModel from "../models/labModel.js";

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

export { cancelAppointment };