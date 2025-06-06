const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const optionalAuthenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null; // Không có token → người dùng ẩn danh
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecretkey"
    );
    const user = await User.findById(decoded.id)
      .populate("profileId")
      .populate("role_code");

    if (!user) {
      req.user = null; // Token đúng nhưng user không còn tồn tại
      return next();
    } else {
      req.user = user; // Lưu thông tin user vào req.user
    }

    next();
  } catch (error) {
    console.log("Token không hợp lệ hoặc hết hạn:", error.message);
    req.user = null; // Token sai → vẫn cho qua nhưng không có user
    next();
  }
};

module.exports = optionalAuthenticateToken;
