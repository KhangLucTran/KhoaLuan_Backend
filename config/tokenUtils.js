const jwt = require("jsonwebtoken");
const Role = require("../models/roleModel"); // Import Role model
const User = require("../models/userModel");

// 1. Tạo AccessToken
const generateAccessToken = async (user) => {
  // Lấy giá trị role_code từ User (ObjectId tham chiếu đến Role)
  const role = await Role.findById(user.role_code); // Truy vấn Role theo role_code (ObjectId)
  console.log("role in generate: ", role);

  // Nếu tìm thấy role, lấy giá trị code
  const roleCode = role ? role.code : null;
  console.log(roleCode);

  return jwt.sign(
    { id: user._id, email: user.email, role_code: roleCode },
    process.env.JWT_SECRET || "defaultsecretkey",
    { expiresIn: "1h" }
  );
};

// 2. Tạo RefreshToken
const generateRefreshToken = (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "defaultsecretkey",
    { expiresIn: "7d" }
  );

  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  return { token, expiry };
};

// 3. Hàm tạo cả AccessToken và RefreshToken
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return {
    accessToken,
    refreshToken,
  };
};

// 4. Xử lí xoay vòng RefreshToken
const rotateRefreshToken = async (oldrefreshToken) => {
  try {
    // Giải mã refresh token để lấy userId
    const decoded = jwt.verify(
      oldrefreshToken,
      process.env.JWT_SECRET || "defaultsecretkey"
    );

    // Tìm người dùng với RefreshToken hợp lệ
    const user = await User.findById(decoded.id);
    if (!user || user.refresh_token !== oldrefreshToken) {
      throw new Error("Refresh token không hợp lệ.");
    }

    const now = Date.now();

    // Kiểm tra thời gian hết hạn của RefreshToken
    if (user.refresh_token_expiry > now) {
      // Nếu refresh token còn hạn, tạo mới accessToken nhưng giữ nguyên refreshToken
      const accessToken = generateAccessToken(user);
      return {
        accessToken,
        refreshToken: {
          token: oldrefreshToken,
          expiry: user.refresh_token_expiry,
        },
      };
    } else {
      // Nếu refresh token đã hết hạn, tạo mới cả refreshToken và accessToken
      const tokens = generateTokens(user);

      // Cập nhật refreshToken mới vào cơ sở dữ liệu
      await User.findByIdAndUpdate(user._id, {
        refresh_token: tokens.refreshToken.token,
        refresh_token_expiry: tokens.refreshToken.expiry,
      });

      return tokens;
    }
  } catch (error) {
    throw new Error(
      "Refresh token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
    );
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  rotateRefreshToken,
};
