import express from "express";
import authUser from "../middlewares/authUser.js";
import authAdmin from "../middlewares/authAdmin.js";
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderPaymob,
  paymobWebhook,
  updateOrderStatus,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Place order routes
orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.post("/paymob", authUser, placeOrderPaymob);

// Webhook for Paymob (no authentication needed for webhook)
orderRouter.post("/paymob-webhook", paymobWebhook);

// Get orders
orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/all", authAdmin, getAllOrders);

// Admin routes
orderRouter.patch("/status", authAdmin, updateOrderStatus);

export default orderRouter;
