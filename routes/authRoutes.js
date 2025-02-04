const express = require("express");
const router = express.Router();
const passport = require("passport");
const authenticateToken = require("../middleware/authMiddleware");
const {
  registerController,
  loginController,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyAccount,
  sendMailVerifyAccount,
  changePassword,
  googleCallback,
  googleLogin,
} = require("../controllers/authController");

// API đăng kí (không cần Token)
router.post("/register", registerController);
// API đăng nhập (không cần Token)
router.post("/login", loginController);
// API gửi OTP qua email (không cần Token)
router.post("/forgot-password", forgotPassword);
// API xác nhận OTP (không cần Token)
router.post("/verify-otp", verifyOTP);
// API đặt lại mật khẩu mới (không cần Token)
router.post("/reset-password", resetPassword);
// API xác thực tài khoản (không cần Token)
router.get("/verify-account/:email", verifyAccount);
// API gửi mail xác thực tài khoản
router.post("/send-mail-verify/:email", sendMailVerifyAccount);
// API đổi mật khẩu (cần token)
router.post("/change-password", authenticateToken, changePassword);

// Định tuyến đăng nhập qua Google
router.get("/google", googleLogin);

// Callback khi đăng nhập thành công qua Google
router.get("/google/callback", googleCallback);

module.exports = router;
