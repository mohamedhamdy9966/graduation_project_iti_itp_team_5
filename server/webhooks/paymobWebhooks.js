import crypto from "crypto";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";

export const paymobWebhook = async (req, res) => {
  try {
    const receivedHmac = req.query.hmac;
    const payload = req.body;

    // Verify HMAC signature
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
    const transactionId = obj.id;
    const amount = obj.amount_cents;

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
      // Payment successful
      await model.findByIdAndUpdate(appointmentId, {
        payment: true,
        transactionId: transactionId,
        paymentStatus: "completed",
        paidAmount: amount / 100, // Convert from cents
      });

    } else {
      // Payment failed
      await model.findByIdAndUpdate(appointmentId, {
        cancelled: true,
        transactionId: transactionId,
        paymentStatus: "failed",
      });

    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Paymob Webhook Error:", error);
    res.status(400).send("Webhook Error");
  }
};
