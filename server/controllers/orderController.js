import Drug from "../models/Drug.js";
import Order from "../models/Order.js";
import stripe from "stripe";
import User from "../models/User.js";
import axios from "axios";
import crypto from "crypto";

// place order COD : /api/oder/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }
    // calculate Amount Using items
    let amount = await items.reduce(async (acc, item) => {
      const drug = await Drug.findById(item.drug);
      return (await acc) + drug.offerPrice * item.quantity;
    }, 0);
    // add tax Charge (14%)
    amount += Math.floor(amount * 0);
    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });
    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

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

const registerOrder = async (authToken, amountCents, merchantOrderId) => {
  try {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: "EGP",
        merchant_order_id: merchantOrderId.toString(),
      }
    );
    return response.data.id;
  } catch (error) {
    throw new Error(
      `Paymob register order Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

const getPaymentKey = async (
  authToken,
  amountCents,
  orderId,
  billingData,
  integrationId,
  origin
) => {
  try {
    const payload = {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: "EGP",
      integration_id: integrationId,
      success_url: `${origin}/success`, // Dynamic success URL
      cancel_url: `${origin}/cancel`, // Dynamic cancel URL
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

// Place Order with Paymob
export const placeOrderPaymob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address, shippingFee } = req.body;
    const { origin } = req.headers;

    console.log("DEBUG: placeOrderPaymob Input:", {
      userId,
      items,
      address,
      shippingFee,
    });

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }

    // Calculate amount
    const drugTotals = await Promise.all(
      items.map(async (item) => {
        const drug = await Drug.findById(item.drug);
        if (!drug) throw new Error(`Drug ${item.drug} not found`);
        return drug.offerPrice * item.quantity;
      })
    );
    let amount = drugTotals.reduce((acc, val) => acc + val, 0);
    amount += shippingFee || 0;
    amount += Math.floor(amount * 0);
    amount = Math.floor(amount * 100);
    console.log("DEBUG: Calculated Amount (cents):", amount);
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    // Create order in DB
    const order = await Order.create({
      userId,
      items,
      amount: amount / 100,
      address,
      paymentType: "Online",
      status: "Pending Payment",
    });
    console.log("DEBUG: Created Order:", order._id);

    // Get user and address for billing data
    const user = await User.findById(userId);
    const addressDoc = await Address.findById(address);
    if (!addressDoc) throw new Error(`Address ${address} not found`);
    console.log("DEBUG: User Data:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
    console.log("DEBUG: Address Data:", addressDoc);

    // Paymob Integration
    const authToken = await getAuthToken();
    console.log("DEBUG: Auth Token:", authToken);
    const paymobOrderId = await registerOrder(authToken, amount, order._id);
    console.log("DEBUG: Paymob Order ID:", paymobOrderId);

    const billingData = {
      first_name: addressDoc.firstName || user.name.split(" ")[0] || "Unknown",
      last_name: addressDoc.lastName || user.name.split(" ")[1] || "Unknown",
      email: addressDoc.email || user.email || "no-email@domain.com",
      phone_number: addressDoc.phone
        ? `+2${addressDoc.phone}`
        : user.phone
        ? `+2${user.phone}`
        : "+201000000000",
      street: addressDoc.street || "Unknown",
      building: addressDoc.building || "Unknown",
      floor: addressDoc.floor || "Unknown",
      apartment: addressDoc.apartment || "Unknown",
      city: addressDoc.city || "Cairo",
      state: addressDoc.state || "Cairo",
      country:
        addressDoc.country?.toUpperCase() === "EGYPT"
          ? "EGY"
          : addressDoc.country || "EGY",
      postal_code: addressDoc.zipcode?.toString() || "00000",
    };
    console.log("DEBUG: Billing Data:", billingData);

    const paymentKey = await getPaymentKey(
      authToken,
      amount,
      paymobOrderId,
      billingData,
      process.env.PAYMOB_INTEGRATION_ID,
      origin
    );
    console.log("DEBUG: Payment Key:", paymentKey);

    const paymentUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
    console.log("DEBUG: Payment URL:", paymentUrl);

    return res.json({ success: true, url: paymentUrl });
  } catch (error) {
    console.error("DEBUG: placeOrderPaymob Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return res.json({ success: false, message: error.message });
  }
};

// Paymob Webhook Handler
export const paymobWebhook = async (req, res) => {
  try {
    // Verify HMAC signature
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
    const ourOrderId = obj.order.merchant_order_id;

    if (obj.success) {
      await Order.findByIdAndUpdate(ourOrderId, {
        isPaid: true,
        status: "Processing",
      });
      const order = await Order.findById(ourOrderId);
      await User.findByIdAndUpdate(order.userId, { cartItems: {} });
    } else {
      await Order.findByIdAndUpdate(ourOrderId, {
        status: "Payment Failed",
      });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(400).send("Webhook Error");
  }
};

// place order Stripe : /api/oder/cod
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid Data" });
    }
    let drugData = [];
    // calculate Amount Using items
    let amount = await items.reduce(async (acc, item) => {
      const drug = await Drug.findById(item.drug);
      drugData.push({
        name: drug.name,
        price: drug.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + drug.offerPrice * item.quantity;
    }, 0);
    // add tax Charge (14%)
    amount += Math.floor(amount * 0);
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });
    // stripe Gateway Intialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    // create line items for stripe
    const line_items = drugData.map((item) => {
      return {
        price_data: {
          currency: "egp",
          drug_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.14) * 100,
        },
        quantity: item.quantity,
      };
    });
    // create session
    const session = await stripeInstance.checkout.sessions.create({
      // payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });
    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// stripe webhooks to verify paymens action : /stripe
export const stripeWebhooks = async (request, response) => {
  //  Stripe Gateway Initialize
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
  }
  // Handle the Event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId, userId } = session.data[0].metadata;
      // Mark Payment as paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      // clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      // getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};

// Get orders by user id : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.drug address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// get all orders (for seller - admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.drug")
      .populate("address")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("getAllOrders error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    } else {
      // Log or end silently to prevent crashing
      console.warn("Headers already sent, cannot respond again.");
    }
  }
};