import jwt from "jsonwebtoken";

const authLab = async (req, res, next) => {
  try {
    const lToken = req.headers.ltoken || req.headers.lToken;

    if (!lToken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(lToken, process.env.JWT_SECRET);
    req.labId = token_decode.id;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    res.json({ success: false, message: "Token verification failed" });
  }
};

export default authLab;
