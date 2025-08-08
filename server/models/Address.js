import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  street: { type: String, required: true },
  building: { type: Number, default: "Unknown" },
  floor: { type: Number, default: "Unknown" },
  apartment: { type: Number, default: "Unknown" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: Number, default: "Unknown" },
  country: { type: String, required: true },
  phone: { type: Number, required: true },
});

const Address =
  mongoose.models.address || mongoose.model("address", addressSchema);

export default Address;