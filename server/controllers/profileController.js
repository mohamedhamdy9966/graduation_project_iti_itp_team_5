import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("File present:", !!req.file);

    const {
      userId,
      name,
      phone,
      address,
      birthDate,
      gender,
      medicalInsurance,
      allergy,
    } = req.body;

    const imageFile = req.file;

    console.log("Parsed data:", {
      userId,
      name,
      phone,
      address: typeof address === "string" ? "JSON string" : typeof address,
      birthDate,
      gender,
      medicalInsurance,
      allergy: typeof allergy === "string" ? "JSON string" : typeof allergy,
      hasImage: !!imageFile,
    });

    // Validation
    if (!name || !phone || !birthDate || !gender || !medicalInsurance) {
      console.log("Validation failed - missing required fields");
      return res.json({ success: false, message: "Data Missing" });
    }

    // Parse JSON strings
    let parsedAddress, parsedAllergy;
    try {
      parsedAddress =
        typeof address === "string" ? JSON.parse(address) : address;
      parsedAllergy =
        typeof allergy === "string" ? JSON.parse(allergy) : allergy || {};
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.json({
        success: false,
        message: "Invalid JSON format in address or allergy data",
      });
    }

    // Update user data
    const updateData = {
      name,
      mobile: phone,
      address: parsedAddress,
      birthDate,
      gender,
      medicalInsurance,
      allergy: parsedAllergy,
    };

    console.log("Updating user with data:", updateData);

    await userModel.findByIdAndUpdate(userId, updateData);

    // Handle image upload if present
    if (imageFile) {
      console.log("Processing image upload");
      console.log("Image file details:", {
        originalname: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
      });

      try {
        const imageUpload = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "user_profiles",
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(error);
                } else {
                  console.log("Cloudinary upload success:", result.secure_url);
                  resolve(result);
                }
              }
            )
            .end(imageFile.buffer);
        });

        const imageURL = imageUpload.secure_url;

        await userModel.findByIdAndUpdate(userId, { image: imageURL });
        console.log("User image updated successfully");
      } catch (imageError) {
        console.error("Image upload error:", imageError);
        return res.json({
          success: false,
          message: `Profile updated but image upload failed: ${imageError.message}`,
        });
      }
    }

    console.log("Profile update completed successfully");
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    console.error("Error stack:", error.stack);
    res.json({ success: false, message: `Update failed: ${error.message}` });
  }
};

export { getProfile, updateProfile };