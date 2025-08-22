import Order from "../models/Order.js";

// Get User Orders: /api/order/user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate({
        path: "items.drug",
        select: "name image category offerPrice",
      })
      .populate({
        path: "address",
        select: "street city state country",
      })
      .sort({ createdAt: -1 });

    // Transform orders for frontend
    const transformedOrders = orders.map((order) => ({
      ...order._doc,
      items: order.items.map((item) => ({
        ...item,
        drug: item.drug || {
          name: "Product Not Found",
          image: ["/placeholder-drug.png"],
          category: "Medicine",
          offerPrice: 0,
        },
      })),
    }));

    res.json({ success: true, orders: transformedOrders });
  } catch (error) {
    console.error("getUserOrders error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export { getUserOrders };