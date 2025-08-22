import { v2 as cloudinary } from "cloudinary";
import Drug from "../models/Drug.js";

// add product : /api/drug/add
export const addDrug = async (req, res) => {
  try {
    const drugData = JSON.parse(req.body.productData);
    const images = req.files;

    console.log("Adding drug:", drugData);
    console.log("Images received:", images?.length || 0);

    // Validate required fields
    if (
      !drugData.name ||
      !drugData.description ||
      !drugData.price ||
      !drugData.category
    ) {
      return res.json({
        success: false,
        message:
          "Missing required fields: name, description, price, or category",
      });
    }

    // Upload images to cloudinary
    let imagesUrl = [];
    if (images && images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
            folder: "drugs", // organize in cloudinary
          });
          return result.secure_url;
        })
      );
    } else {
      // Use default image if no images provided
      imagesUrl = ["https://via.placeholder.com/300x300?text=No+Image"];
    }

    // Set default values
    if (drugData.inStock === undefined) {
      drugData.inStock = true;
    }

    // Create the drug
    const newDrug = await Drug.create({
      ...drugData,
      image: imagesUrl,
      // Use offerPrice as the main price if provided, otherwise use price
      price: drugData.offerPrice || drugData.price,
      offerPrice: drugData.offerPrice || drugData.price,
    });

    console.log("Drug created successfully:", newDrug._id);
    res.json({ success: true, message: "Product Added Successfully" });
  } catch (error) {
    console.error("Add drug error:", error);
    if (error.code === 11000) {
      res.json({
        success: false,
        message: "A drug with this name already exists",
      });
    } else {
      res.json({ success: false, message: error.message });
    }
  }
};

// get all products : /api/drug/list
export const drugList = async (req, res) => {
  try {
    const drugs = await Drug.find({}).sort({ createdAt: -1 });
    res.json({ success: true, drugs });
  } catch (error) {
    console.error("Drug list error:", error);
    res.json({ success: false, message: error.message });
  }
};

// get single product : /api/drug/single
export const drugById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ success: false, message: "Drug ID is required" });
    }

    const drug = await Drug.findById(id);
    if (!drug) {
      return res.json({ success: false, message: "Drug not found" });
    }

    res.json({ success: true, drug });
  } catch (error) {
    console.error("Drug by ID error:", error);
    res.json({ success: false, message: error.message });
  }
};

// change product inStock : /api/drug/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Drug ID is required" });
    }

    const drug = await Drug.findById(id);
    if (!drug) {
      return res.json({ success: false, message: "Drug not found" });
    }

    await Drug.findByIdAndUpdate(id, { inStock });

    const status = inStock ? "in stock" : "out of stock";
    res.json({ success: true, message: `Product marked as ${status}` });
  } catch (error) {
    console.error("Change stock error:", error);
    res.json({ success: false, message: error.message });
  }
};

// remove product : /api/drug/remove
export const removeDrug = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Drug ID is required" });
    }

    const drug = await Drug.findByIdAndDelete(id);
    if (!drug) {
      return res.json({ success: false, message: "Drug not found" });
    }

    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.error("Remove drug error:", error);
    res.json({ success: false, message: error.message });
  }
};
