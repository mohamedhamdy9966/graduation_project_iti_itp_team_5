import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: {
      type: String,
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
    fees: { type: Number, required: true, min: [0, "Fees cannot be negative"] },
    address: {
      type: Object,
      required: true,
      default: { line1: "", line2: "" },
    },
    date: { type: Number, required: true },
    slotsBooked: { type: Object, default: {} },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot exceed 5"],
        },
        feedback: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
