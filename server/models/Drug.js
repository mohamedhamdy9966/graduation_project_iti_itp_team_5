import mongoose from "mongoose";

const drugSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: Array,
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Description cannot be empty",
      },
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    offerPrice: {
      type: Number,
      required: true,
      min: [0, "Offer price cannot be negative"],
    },
    image: {
      type: Array,
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one image is required",
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    inStock: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const Drug = mongoose.models.drug || mongoose.model("drug", drugSchema);

export default Drug;
