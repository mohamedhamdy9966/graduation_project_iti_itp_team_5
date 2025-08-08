import { v2 as cloudinary } from "cloudinary";
import Order from "../models/Order.js";

// add product : /api/product/add
export const addDrug = async (req, res) => {
  try {
    let drugData = JSON.parse(req.body.drugData);
    const images = req.files;
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );
    if (drugData.inStock === undefined) {
      drugData.inStock = true;
    }
    await Drug.create({ ...drugData, image: imagesUrl });
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// get product : /api/product/list
export const drugList = async (req, res) => {
  try {
    const drugs = await Drug.find({});
    res.json({ success: true, drugs });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// get single product : /api/product/list
export const drugById = async (req, res) => {
  try {
    const { id } = req.body;
    const drug = await Drug.findById(id);
    res.json({ success: true, drug });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// change product inStock : /api/product/id
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Drug.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "stock Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
