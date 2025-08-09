import User from "../models/userModel.js";

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    // Get userId from authenticated request
    const userId = req.user.id;
    const { cartItems } = req.body;
    await User.findByIdAndUpdate(userId, { cartItems });
    res.json({ success: true, message: "cart Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};