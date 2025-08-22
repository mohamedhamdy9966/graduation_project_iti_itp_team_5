import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";
import stripe from "stripe";

// API to pay for appointment with Stripe
const payAppointmentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    console.log(`Processing Stripe payment for appointment: ${appointmentId}`);

    let appointment = await appointmentDoctorModel.findById(appointmentId);
    let isDoctorAppointment = true;

    if (!appointment) {
      appointment = await appointmentLabModel.findById(appointmentId);
      isDoctorAppointment = false;

      if (!appointment) {
        console.error(`Appointment not found: ${appointmentId}`);
        return res.json({ success: false, message: "Appointment Not Found" });
      }
    }

    if (appointment.userId !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Appointment Already Paid" });
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: "Appointment Cancelled" });
    }

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: isDoctorAppointment
              ? `Appointment with ${appointment.docData.name}`
              : `Lab Test - ${appointment.docData.name}`,
            description: `Date: ${appointment.slotDate}, Time: ${appointment.slotTime}`,
          },
          unit_amount: Math.floor(appointment.amount * 100),
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${appointmentId}`,
      cancel_url: `${origin}/cancel?appointment_id=${appointmentId}`,
      metadata: {
        appointmentId: appointment._id.toString(),
        userId,
        isDoctorAppointment: isDoctorAppointment.toString(),
      },
      customer_email: appointment.userData.email || undefined,
    });

    console.log(
      `✅ Stripe session created: ${session.id} for appointment: ${appointmentId}`
    );

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe payment error:", error);
    res.json({ success: false, message: error.message });
  }
};

export { payAppointmentStripe };