const authService = require("../services/authService");
const passport = require("./../config/passportConfig");
const {
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
} = require("../config/tokenUtils");
const { sendVerifyEmail } = require("../services/emailService");

// 1. Controller đăng ký
const registerController = async (req, res) => {
  try {
    const { email, password, username, numberphone } = req.body;
    const result = await authService.registerService({
      email,
      password,
      username,
      numberphone,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Controller đăng nhập (Update)
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Controller làm mới token
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const result = await authService.refreshAccessToken(refresh_token);
    res
      .status(200)
      .json({ error: 0, message: "Token refreshed successfully", ...result });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(400).json({ error: 1, message: error.message });
  }
};

// 4. Controller quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPasswordUser(email);
    res
      .status(200)
      .json({ error: 0, message: "Password forget successfully", ...result });
  } catch (error) {
    console.error("Forgot Password Error: ", error);
    res.status(500).json({ error: 1, message: error.message });
  }
};

// 5. Controller xác nhận OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Kiểm tra xem email và otp có được cung cấp không
    if (!email || !otp) {
      return res
        .status(400)
        .json({ error: 1, message: "Email and OTP are required." });
    }

    const result = await authService.verifyOTPUser(email, otp);

    // Nếu xác nhận thành công
    if (result.error === 0) {
      return res
        .status(200)
        .json({ error: 0, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: 1, message: result.message });
    }
  } catch (error) {
    console.error("Verify OTP Error: ", error);
    return res.status(500).json({ error: 1, message: error.message });
  }
};

// 6. Controller đặt lại mật khẩu
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const result = await authService.resetPasswordUser(email, newPassword);
    return res
      .status(200)
      .json({ error: 0, message: "Password reseted successfully", ...result });
  } catch (error) {
    console.error("Reset Password Error: ", error);
    return res.status(500).json({ error: 1, message: error.message });
  }
};

// 7. Controller xác thực tài khoản
const verifyAccount = async (req, res) => {
  try {
    const { email } = req.params;
    const result = await authService.verifyAccountUser(email);
    return res.redirect("http://localhost:5173/levents/login");
  } catch (error) {
    console.eror("Verify Account Error: ", error);
    return res.status(500).json({ error: 1, message: error.message });
  }
};

// 8. Controller gửi mail xác thực tài khoản
const sendMailVerifyAccount = async (req, res) => {
  try {
    const { email } = req.params;
    await sendVerifyEmail(email);
    return res
      .status(200)
      .json({ error: 0, message: "Send Verify Account Email successfully." });
  } catch (error) {
    console.error("Send Verify Account Email failed.", error);
    return res.status(500).json({ error: 1, message: error.message });
  }
};

// 9.Controller đổi mật khẩu của user đang đăng nhập
const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePasswordUser(
      userId,
      oldPassword,
      newPassword
    );
    return res.status(200).json({
      error: 0,
      message: "Change Password Successfully......",
      ...result,
    });
  } catch (error) {
    console.error("Change Password User failed.", error);
    return res.status(500).json({ error: 1, message: error.message });
  }
};

// 10. Controller đăng nhập bằng Google
const googleLogin = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

// 11. Callback sau khi người dùng đăng nhập thành công
const googleCallback = async (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err) {
      console.error("Google Authentication Error:", err);
      return res.status(500).json({ message: "Lỗi xác thực", error: err });
    }

    if (!user) {
      console.error("Google Authentication Failed: No User Found");
      return res.status(401).json({ message: "Không tìm thấy người dùng" });
    }

    try {
      // Tạo JWT token (AccessToken và RefreshToken)
      const accessToken = await generateAccessToken(user);
      const refreshToken = generateRefreshToken(user._id);

      // Chuyển hướng đến frontend với token trong URL
      const redirectUrl = `http://localhost:5173/levents/login?access_token=${accessToken}&refresh_token=${refreshToken.token}`;
      res.redirect(redirectUrl);
    } catch (tokenError) {
      console.error("Token Generation Error:", tokenError);
      return res
        .status(500)
        .json({ message: "Lỗi tạo token", error: tokenError });
    }
  })(req, res, next);
};

// 12. Xử lí accessToken và refreshToken
const refreshTokenCotroller = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token là bắt buộc" });
  }

  try {
    // Gọi hàm xoay vòng refresh token
    const tokens = await rotateRefreshToken(refreshToken);
    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
module.exports = {
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
  refreshTokenCotroller,
};
