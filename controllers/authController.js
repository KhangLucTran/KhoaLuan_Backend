const {
  registerUser,
  loginUser,
  refreshAccessToken,
  forgotPasswordUser,
  verifyOTPUser,
  resetPasswordUser,
  verifyAccountUser,
  changePasswordUser,
} = require("../services/authService");
const { sendVerifyEmail } = require("../services/emailService");
// 1. Controller đăng ký
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const result = await registerUser({ email, password, username });
    res
      .status(201)
      .json({ error: 0, message: "Register is successful!", ...result });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({ error: 1, message: error.message });
  }
};

// 2. Controller đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res
      .status(200)
      .json({ error: 0, message: "Login is successful", ...result });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(400).json({ error: 1, message: error.message });
  }
};

// 3. Controller làm mới token
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const result = await refreshAccessToken(refresh_token);
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
    const result = await forgotPasswordUser(email);
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

    const result = await verifyOTPUser(email, otp);

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
    const result = await resetPasswordUser(email, newPassword);
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
    const result = await verifyAccountUser(email);
    return res.redirect("http://localhost:3000/login");
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
    const result = await changePasswordUser(userId, oldPassword, newPassword);
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

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyAccount,
  sendMailVerifyAccount,
  changePassword,
};
