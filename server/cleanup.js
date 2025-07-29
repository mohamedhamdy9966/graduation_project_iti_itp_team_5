// In a new file, e.g., cleanup.js
import mongoose from "mongoose";
import tempFileModel from "./models/tempFileModel.js";

const cleanupTempFiles = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await tempFileModel.deleteMany({ createdAt: { $lt: oneDayAgo } });
    console.log("Cleaned up old temporary files");
  } catch (error) {
    console.error("Error cleaning up temp files:", error);
  }
};

// Run every 24 hours
setInterval(cleanupTempFiles, 24 * 60 * 60 * 1000);

export default cleanupTempFiles;
