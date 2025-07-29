import crypto from "crypto";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";

export const paymobWebhook = async (req, res) => {
  try {
    const receivedHmac = req.query.hmac;
    const payload = req.body;
    const secureHash = crypto
      .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (secureHash !== receivedHmac) {
      console.error("Invalid HMAC signature");
      return res.status(403).send("Invalid HMAC signature");
    }

    const { obj } = req.body;
    const appointmentId = obj.order.merchant_order_id;

    // Determine if it's a doctor or lab appointment
    let appointment = await appointmentDoctorModel.findById(appointmentId);
    let isDoctorAppointment = true;
    if (!appointment) {
      appointment = await appointmentLabModel.findById(appointmentId);
      isDoctorAppointment = false;
      if (!appointment) {
        console.error("Appointment not found:", appointmentId);
        return res.status(404).send("Appointment not found");
      }
    }

    const model = isDoctorAppointment
      ? appointmentDoctorModel
      : appointmentLabModel;

    if (obj.success) {
      await model.findByIdAndUpdate(appointmentId, { payment: true });
    } else {
      await model.findByIdAndUpdate(appointmentId, { cancelled: true });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(400).send("Webhook Error");
  }
};
