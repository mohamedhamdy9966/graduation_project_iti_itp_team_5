import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderStripe,
  placeOrderPaymob,
} from "../controllers/orderController.js";
import authAdmin from "../middlewares/authAdmin.js";

const orderRouter = express.Router();

orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/paymob", authUser, placeOrderPaymob);
orderRouter.get("/user", authUser, getUserOrders);
orderRouter.get("/", authAdmin, getAllOrders);

export default orderRouter;
