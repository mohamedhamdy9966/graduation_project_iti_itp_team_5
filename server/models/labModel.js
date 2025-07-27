import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: {
      type: Number,
      required: true,
      unique: true,
      default: "000000000",
    },
    password: { type: String, required: true },
    image: { type: String, required: true },
    specialty: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    address: {
      type: Object,
      required: true,
      default: { line1: "", line2: "" },
    },
    date: { type: Number, required: true },
    slotsBooked: { type: Object, default: {} },
  },
  { minimize: false }
);

const labModel =
  mongoose.models.lab || mongoose.model("lab", labSchema);

export default labModel;
