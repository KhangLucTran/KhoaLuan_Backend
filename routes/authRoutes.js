const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const authControler = require("../controllers/authController");

// 1. API đăng kí (không cần Token)
router.post("/register", authControler.registerController);

// 2. API đăng nhập (không cần Token)
router.post("/login", authControler.loginController);

// 3. API gửi OTP qua email (không cần Token)
router.post("/forgot-password", authControler.forgotPassword);

// 4. API xác nhận OTP (không cần Token)
router.post("/verify-otp", authControler.verifyOTP);

// 5. API đặt lại mật khẩu mới (không cần Token)
router.post("/reset-password", authControler.resetPassword);

// 6. API xác thực tài khoản (không cần Token)
router.get("/verify-account/:email", authControler.verifyAccount);

// 7. API gửi mail xác thực tài khoản
router.post("/send-mail-verify/:email", authControler.sendMailVerifyAccount);

// 8. API xử lí accessToken hết hạn
router.post("/refresh-token", authControler.refreshTokenCotroller);

// 9. API đổi mật khẩu (cần token)
router.post(
  "/change-password",
  authenticateToken,
  authControler.changePassword
);

// 10. Định tuyến đăng nhập qua Google
router.get("/google", authControler.googleLogin);

// 11. Callback khi đăng nhập thành công qua Google
router.get("/google/callback", authControler.googleCallback);

// 12. Định tuyến đăng nhập qua Facebook
router.get("/facebook", authControler.facebookLogin);

// 13. Callback khi đăng nhập thành công qua Google
router.get("/facebook/callback", authControler.facebookCallback);

module.exports = router;
