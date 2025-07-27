import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const { dToken } = req.headers;

    if (!dToken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(dToken, process.env.JWT_SECRET);
    req.body.docId = token_decode.id;
    next();
  } catch (error) {
    console.log("Auth error:", error.message); // Add logging for debugging
    res.json({ success: false, message: "Token verification failed" });
  }
};

export default authDoctor;
