import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";
import labModel from "../models/labModel.js";
import axios from "axios";
import stripe from "stripe";

// Helper function to get Paymob auth token
const getAuthToken = async () => {
  try {
    const rawKey = process.env.PAYMOB_API_KEY;
    if (!rawKey) {
      throw new Error("PAYMOB_API_KEY is not defined in environment variables");
    }
    const cleanedKey = rawKey.trim();

    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/auth/tokens",
      { api_key: cleanedKey },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error("DEBUG: Paymob Auth Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(
      `Paymob Auth Token Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Helper function to register Paymob appointment
const registerAppointment = async (
  authToken,
  amountCents,
  merchantAppointmentId
) => {
  try {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: "EGP",
        merchant_order_id: merchantAppointmentId.toString(),
      }
    );
    return response.data.id;
  } catch (error) {
    throw new Error(
      `Paymob register Appointment Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Helper function to get Paymob payment key
const getPaymentKey = async (
  authToken,
  amountCents,
  appointmentId,
  billingData,
  integrationId,
  origin
) => {
  try {
    const payload = {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: appointmentId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: integrationId,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    };
    console.log("DEBUG: getPaymentKey Payload:", payload);
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/acceptance/payment_keys",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("DEBUG: getPaymentKey Response:", response.data);
    return response.data.token;
  } catch (error) {
    console.error("DEBUG: getPaymentKey Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw new Error(
      `Paymob get payment key Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }
    let slotsBooked = docData.slotsBooked;
    if (slotsBooked[slotDate]) {
      if (slotsBooked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot Not Available" });
      } else {
        slotsBooked[slotDate].push(slotTime);
      }
    } else {
      slotsBooked[slotDate] = [];
      slotsBooked[slotDate].push(slotTime);
    }
    const userData = await userModel.findById(userId).select("-password");
    if (!userData) {
      return res.json({ success: false, message: "User Not Found" });
    }
    delete docData.slotsBooked;
    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };
    const newAppointment = new appointmentDoctorModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slotsBooked });
    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

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

// API to pay for appointment with Paymob
const payAppointmentPaymob = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId;
    const { origin } = req.headers;

    let appointment = await appointmentDoctorModel.findById(appointmentId);
    let isDoctorAppointment = true;
    if (!appointment) {
      appointment = await appointmentLabModel.findById(appointmentId);
      isDoctorAppointment = false;
      if (!appointment) {
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

    const amountCents = Math.floor(appointment.amount * 100);

    const user = await userModel.findById(userId);
    const billingData = {
      first_name: user.name.split(" ")[0] || "Unknown",
      last_name: user.name.split(" ")[1] || "Unknown",
      email: user.email || "no-email@domain.com",
      phone_number: user.mobile ? `+2${user.mobile}` : "+201000000000",
      street: "Unknown",
      building: "Unknown",
      floor: "Unknown",
      apartment: "Unknown",
      city: "Cairo",
      state: "Cairo",
      country: "EGY",
      postal_code: "00000",
    };

    const authToken = await getAuthToken();
    const paymobAppointmentId = await registerAppointment(
      authToken,
      amountCents,
      appointmentId
    );
    const paymentKey = await getPaymentKey(
      authToken,
      amountCents,
      paymobAppointmentId,
      billingData,
      process.env.PAYMOB_INTEGRATION_ID,
      origin
    );

    const paymentUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
    res.json({ success: true, url: paymentUrl });
  } catch (error) {
    console.error("DEBUG: payAppointmentPaymob Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    res.json({ success: false, message: error.message });
  }
};

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

export {
  bookAppointment,
  listAppointment,
  cancelAppointment,
  payAppointmentPaymob,
  payAppointmentStripe,
};