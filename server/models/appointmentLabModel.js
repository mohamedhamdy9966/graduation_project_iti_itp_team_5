import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    labId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paymob"],
      default: null,
    },
    paymentIntentId: { type: String, default: null },
    stripeSessionId: { type: String, default: null },
    transactionId: { type: String, default: null },
    paidAmount: { type: Number, default: null },
  },
  { timestamps: true }
);

const appointmentLabModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentLabModel;
