import Drug from "../models/Drug.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";

// Place Order COD: /api/order/cod
const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address } = req.body;

    console.log("COD Order request:", { userId, items, address });

    if (!address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Data - Missing items or address",
      });
    }

    // Validate address exists
    const addressDoc = await Address.findById(address);
    if (!addressDoc) {
      return res.json({ success: false, message: "Invalid address selected" });
    }

    // Validate all drugs exist and calculate amount
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

    // Add tax (0% as per your current setup)
    const taxAmount = Math.floor(amount * 0);
    const totalAmount = amount + taxAmount;

    console.log("Order calculation:", { amount, taxAmount, totalAmount });

    // Create order
    const newOrder = await Order.create({
      userId,
      items: validatedItems,
      amount: totalAmount,
      address,
      paymentType: "COD",
      status: "Order Placed",
      createdAt: new Date(),
    });

    console.log("Order created:", newOrder._id);

    return res.json({
      success: true,
      message: "Order Placed Successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("COD Order error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export { placeOrderCOD };