import Order from "../models/Order.js";
import User from "../models/userModel.js";
import Address from "../models/Address.js";

// Get All Orders (Admin): /api/order/all
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate({
        path: "items.drug",
        select: "name image category offerPrice",
      })
      .populate({
        path: "address",
        select: "street city state country firstName lastName phone",
      })
      .populate({
        path: "userId",
        select: "name email mobile",
      })
      .sort({ createdAt: -1 });

    // Transform orders for admin panel
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
      customerInfo: order.userId
        ? {
            name: order.userId.name,
            email: order.userId.email,
            mobile: order.userId.mobile,
          }
        : null,
    }));

    return res.status(200).json({ success: true, orders: transformedOrders });
  } catch (error) {
    console.error("getAllOrders error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

// Update Order Status (Admin): /api/order/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const validStatuses = [
      "Order Placed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        updatedAt: new Date(),
        ...(status === "Delivered" && { deliveredAt: new Date() }),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.json({ success: false, message: error.message });
  }
};

export { getAllOrders, updateOrderStatus };