import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  updateCart,
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const cartRouter = express.Router();

// Update entire cart
cartRouter.patch("/update", authUser, updateCart);

// Get user cart
cartRouter.get("/get", authUser, getCart);

// Add item to cart
cartRouter.post("/add", authUser, addToCart);

// Remove item from cart
cartRouter.delete("/remove", authUser, removeFromCart);

// Clear cart
cartRouter.delete("/clear", authUser, clearCart);

export default cartRouter;
