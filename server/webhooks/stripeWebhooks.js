import stripe from "stripe";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { appointmentId, userId, isDoctorAppointment } =
        session.data[0].metadata;
      const model =
        isDoctorAppointment === "true"
          ? appointmentDoctorModel
          : appointmentLabModel;
      await model.findByIdAndUpdate(appointmentId, { payment: true });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { appointmentId, isDoctorAppointment } = session.data[0].metadata;
      const model =
        isDoctorAppointment === "true"
          ? appointmentDoctorModel
          : appointmentLabModel;
      await model.findByIdAndUpdate(appointmentId, { cancelled: true });
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};
