import mongoose from "mongoose";

const tempFileSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g., "audio/webm", "image/jpeg"
    url: { type: String, required: true },
    transcription: { type: String }, // For audio files
    textContent: { type: String }, // For PDF files
    sessionId: { type: String, default: "anonymous" }, // Track unauthenticated users
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const tempFileModel =
  mongoose.models.tempFile || mongoose.model("tempFile", tempFileSchema);

export default tempFileModel;
