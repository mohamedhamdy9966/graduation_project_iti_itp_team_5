import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    mobile: {
      type: String,
      required: true,
      unique: true,
      default: "000000000",
    },
    password: { type: String, required: true },
    image: { type: String, required: true },
    services: { type: [String], required: true, default: [] },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true, min: [0, "Fees cannot be negative"] },
    address: {
      type: Object,
      required: true,
      default: { line1: "", line2: "" },
    },
    date: { type: Number, default: Date.now },
    slotsBooked: { type: Object, default: {} },
  },
  { minimize: false }
);

const labModel =
  mongoose.models.lab || mongoose.model("lab", labSchema);

export default labModel;
