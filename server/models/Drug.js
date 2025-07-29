import mongoose from "mongoose";

const drugSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true, min: [0, "Fees cannot be negative"] },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Drug =
  mongoose.models.drug || mongoose.model("drug", drugSchema);

export default Drug;