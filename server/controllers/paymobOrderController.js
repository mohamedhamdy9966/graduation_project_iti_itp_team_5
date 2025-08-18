import Drug from "../models/Drug.js";
import Order from "../models/Order.js";
import User from "../models/userModel.js";
import Address from "../models/Address.js";
import axios from "axios";
import crypto from "crypto";

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
    console.error("Paymob Auth Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      `Paymob Auth Token Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Helper function to register Paymob order
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

// Helper function to get Paymob payment key
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
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    };

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
    return response.data.token;
  } catch (error) {
    console.error("getPaymentKey Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(
      `Paymob get payment key Error: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Place Order with Paymob: /api/order/paymob
const placeOrderPaymob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address, shippingFee } = req.body;
    const origin =
      req.headers.origin || req.headers.referer || "http://localhost:3000";

    console.log("Paymob Order request:", {
      userId,
      items,
      address,
      shippingFee,
    });

    if (!address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Data - Missing items or address",
      });
    }

    // Validate address
    const addressDoc = await Address.findById(address);
    if (!addressDoc) {
      return res.json({ success: false, message: "Invalid address selected" });
    }

    // Calculate amount and validate drugs
    let amount = 0;
    const validatedItems = [];

    for (const item of items) {
      const drug = await Drug.findById(item.drug);
      if (!drug) {
        return res.json({
          success: false,
          message: `Drug with ID ${item.drug} not found`,
        });
      }
      if (!drug.inStock) {
        return res.json({
          success: false,
          message: `${drug.name} is currently out of stock`,
        });
      }

      const quantity = item.quantity || 1;
      amount += drug.offerPrice * quantity;

      validatedItems.push({
        drug: item.drug,
        quantity: quantity,
        price: drug.offerPrice,
        name: drug.name,
      });
    }

    // Add shipping and tax
    amount += shippingFee || 0;
    amount += Math.floor(amount * 0);

    const amountCents = Math.floor(amount * 100);

    console.log("Amount calculation:", { amount, amountCents });

    if (amountCents <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    // Create order in database
    const order = await Order.create({
      userId,
      items: validatedItems,
      amount: amount,
      address,
      paymentType: "Online",
      status: "Pending Payment",
      createdAt: new Date(),
    });

    console.log("Order created:", order._id);

    // Get user data for billing
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Prepare billing data
    const billingData = {
      first_name: addressDoc.firstName || user.name.split(" ")[0] || "Customer",
      last_name:
        addressDoc.lastName ||
        user.name.split(" ").slice(1).join(" ") ||
        "User",
      email: addressDoc.email || user.email || "customer@example.com",
      phone_number: addressDoc.phone
        ? `+2${addressDoc.phone}`
        : user.mobile
        ? `+2${user.mobile}`
        : "+201000000000",
      street: addressDoc.street || "Unknown Street",
      building: addressDoc.building || "Unknown",
      floor: addressDoc.floor || "Unknown",
      apartment: addressDoc.apartment || "Unknown",
      city: addressDoc.city || "Cairo",
      state: addressDoc.state || "Cairo",
      country: addressDoc.country?.toUpperCase() === "EGYPT" ? "EGY" : "EGY",
      postal_code: addressDoc.zipcode?.toString() || "00000",
    };

    console.log("Billing data prepared:", billingData);

    // Paymob Integration
    const authToken = await getAuthToken();
    const paymobOrderId = await registerOrder(authToken, amountCents, order._id);
    const paymentKey = await getPaymentKey(
      authToken,
      amountCents,
      paymobOrderId,
      billingData,
      process.env.PAYMOB_INTEGRATION_ID,
      origin
    );

    const paymentUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    console.log("Payment URL generated:", paymentUrl);

    return res.json({ success: true, url: paymentUrl });
  } catch (error) {
    console.error("Paymob Order error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return res.json({ success: false, message: error.message });
  }
};

// Paymob Webhook Handler: /api/order/paymob-webhook
const paymobWebhook = async (req, res) => {
  try {
    // Verify HMAC signature
    const receivedHmac = req.query.hmac;
    const payload = req.body;

    if (process.env.PAYMOB_HMAC_SECRET) {
      const secureHash = crypto
        .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");

      if (secureHash !== receivedHmac) {
        console.error("Invalid HMAC signature");
        return res.status(403).send("Invalid HMAC signature");
      }
    }

    const { obj } = req.body;
    const ourOrderId = obj.order.merchant_order_id;

    console.log(
      "Webhook received for order:",
      ourOrderId,
      "Success:",
      obj.success
    );

    if (obj.success) {
      // Payment successful
      await Order.findByIdAndUpdate(ourOrderId, {
        isPaid: true,
        status: "Processing",
        paidAt: new Date(),
      });

      // Clear user's cart
      const order = await Order.findById(ourOrderId);
      if (order) {
        await User.findByIdAndUpdate(order.userId, { cartItems: {} });
      }
    } else {
      // Payment failed
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

export { placeOrderPaymob, paymobWebhook };