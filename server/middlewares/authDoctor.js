import jwt from "jsonwebtoken";

// authDoctor.js
const authDoctor = async (req, res, next) => {
  try {
    const dToken = req.headers.dtoken || req.headers.dToken; 

    if (!dToken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(dToken, process.env.JWT_SECRET);
    req.docId = token_decode.id;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    res.json({ success: false, message: "Token verification failed" });
  }
};

export default authDoctor;
