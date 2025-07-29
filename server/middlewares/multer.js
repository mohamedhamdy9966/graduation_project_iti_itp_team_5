import multer from "multer";

const storage = multer.memoryStorage(); // Use memory storage to handle buffers directly

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error("Invalid file type. Only audio, images, or PDFs are allowed.")
      );
    }
  },
});

export default upload;
