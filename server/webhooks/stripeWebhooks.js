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
    console.error("Webhook signature verification failed:", error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  console.log(`Processing Stripe event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Checkout session completed:", session.id);

      try {
        const { appointmentId, userId, isDoctorAppointment } = session.metadata;

        if (!appointmentId) {
          console.error("No appointmentId in session metadata");
          break;
        }

        const model =
          isDoctorAppointment === "true"
            ? appointmentDoctorModel
            : appointmentLabModel;

        // Update appointment immediately when session completes
        const updateResult = await model.findByIdAndUpdate(
          appointmentId,
          {
            payment: true,
            paymentStatus: "completed",
            stripeSessionId: session.id,
            paidAmount: session.amount_total / 100, // Convert from cents
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (updateResult) {
          console.log(
            `✅ Payment successful for appointment: ${appointmentId}`
          );
        } else {
          console.error(`❌ Failed to update appointment: ${appointmentId}`);
        }
      } catch (error) {
        console.error("Error processing checkout.session.completed:", error);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log("Payment intent succeeded:", paymentIntent.id);

      try {
        // Get the session associated with this payment intent
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          const { appointmentId, isDoctorAppointment } = session.metadata;

          if (appointmentId) {
            const model =
              isDoctorAppointment === "true"
                ? appointmentDoctorModel
                : appointmentLabModel;

            await model.findByIdAndUpdate(appointmentId, {
              payment: true,
              paymentStatus: "completed",
              paymentIntentId: paymentIntent.id,
              stripeSessionId: session.id,
              paidAmount: paymentIntent.amount / 100,
              updatedAt: new Date(),
            });

            console.log(
              `✅ Payment intent confirmed for appointment: ${appointmentId}`
            );
          }
        }
      } catch (error) {
        console.error("Error processing payment_intent.succeeded:", error);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      console.log("Payment intent failed:", paymentIntent.id);

      try {
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          const { appointmentId, isDoctorAppointment } = session.metadata;

          if (appointmentId) {
            const model =
              isDoctorAppointment === "true"
                ? appointmentDoctorModel
                : appointmentLabModel;

            await model.findByIdAndUpdate(appointmentId, {
              cancelled: true,
              paymentStatus: "failed",
              paymentIntentId: paymentIntent.id,
              updatedAt: new Date(),
            });

            console.log(`❌ Payment failed for appointment: ${appointmentId}`);
          }
        }
      } catch (error) {
        console.error("Error processing payment_intent.payment_failed:", error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }

  response.json({ received: true });
};
