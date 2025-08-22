import userModel from "../models/userModel.js";
import appointmentDoctorModel from "../models/appointmentDoctorModel.js";
import appointmentLabModel from "../models/appointmentLabModel.js";
import axios from "axios";

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

export { payAppointmentPaymob, getAuthToken, registerAppointment, getPaymentKey };