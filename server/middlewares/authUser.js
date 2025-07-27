import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized, Please Login Again",
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id; // Store userId in req.userId instead of req.body
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
