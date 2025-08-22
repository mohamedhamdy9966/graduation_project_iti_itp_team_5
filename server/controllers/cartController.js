import User from "../models/userModel.js";

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    // Get userId from authenticated request
    const userId = req.user.id;
    const { cartItems } = req.body;

    console.log("Updating cart for user:", userId);
    console.log("Cart items:", cartItems);

    // Validate cartItems
    if (!cartItems || typeof cartItems !== "object") {
      return res.json({ success: false, message: "Invalid cart items format" });
    }

    // Update user's cart
    await User.findByIdAndUpdate(userId, { cartItems });

    console.log("Cart updated successfully");
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get User Cart : /api/cart/get
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("cartItems");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      cartItems: user.cartItems || {},
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    res.json({ success: false, message: error.message });
  }
};

// Add to Cart : /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { drugId, quantity = 1 } = req.body;

    if (!drugId) {
      return res.json({ success: false, message: "Drug ID is required" });
    }

    // Get current user cart
    const user = await User.findById(userId).select("cartItems");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartItems = user.cartItems || {};

    // Add or update item in cart
    if (cartItems[drugId]) {
      cartItems[drugId] += parseInt(quantity);
    } else {
      cartItems[drugId] = parseInt(quantity);
    }

    // Update user cart
    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({
      success: true,
      message: "Added to cart successfully",
      cartItems,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.json({ success: false, message: error.message });
  }
};

// Remove from Cart : /api/cart/remove
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { drugId } = req.body;

    if (!drugId) {
      return res.json({ success: false, message: "Drug ID is required" });
    }

    // Get current user cart
    const user = await User.findById(userId).select("cartItems");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    let cartItems = user.cartItems || {};

    // Remove item from cart
    if (cartItems[drugId]) {
      delete cartItems[drugId];
    }

    // Update user cart
    await User.findByIdAndUpdate(userId, { cartItems });

    res.json({
      success: true,
      message: "Removed from cart successfully",
      cartItems,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.json({ success: false, message: error.message });
  }
};

// Clear Cart : /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.json({ success: false, message: error.message });
  }
};
