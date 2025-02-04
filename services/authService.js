const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Role = require("../models/roleModel");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
require("dotenv").config();
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../config/tokenUtils");
const { sendOtpEmail } = require("../services/emailService");

// 1. Hàm đăng ký người dùng
const registerUser = async ({
  email,
  password,
  username,
  addressData = null,
}) => {
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new Error("Email đã tồn tại!");
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Nếu có addressData thì tạo địa chỉ, nếu không thì bỏ qua
  let address = null;
  if (addressData) {
    address = await Address.create({
      addressLine: "",
      province: "",
      district: "",
    });
  }

  // Tạo hồ sơ Profile mới, với address là null nếu không có addressData
  const newProfile = await Profile.create({
    username,
    address: address ? address._id : null, // Lưu ObjectId nếu có, hoặc null nếu không có,
  });

  // Lấy vai trò mặc định R3-User
  const roleR3 = await Role.findOne({ code: "R3" });
  if (!roleR3) {
    throw new Error(
      "Default role 'R3-User' not found. Please initialize roles."
    );
  }

  // Tạo người dùng mới
  const newUser = await User.create({
    email,
    password: hashedPassword,
    profileId: newProfile._id,
    role_code: roleR3._id,
  });

  // Tạo giỏ hàng mới
  await Cart.create({
    user: newUser._id, // Lưu userId vào Cart
    items: [], // Giỏ hàng bắt đầu trống
    totalAmount: 0, // Giỏ hàng bắt đầu với tổng giá trị bằng 0
  });

  // Tạo AccessToken và RefreshToken
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser._id);

  // Lưu lại refreshToken vào cơ sở dữ liệu
  await User.findByIdAndUpdate(newUser._id, {
    refresh_token: refreshToken.token,
    refresh_token_expiry: refreshToken.expiry,
  });

  return {
    userId: newUser._id,
    profileId: newProfile._id,
    access_token: accessToken,
    refresh_token: refreshToken.token,
  };
};

// 2. Hàm đăng nhập người dùng (Uppdate)
const loginService = {
  async login(email, password) {
    try {
      const user = await User.findOne({ email })
        .select("password verifyState profileId refresh_token")
        .populate("profileId")
        .lean(); // Giảm tải Mongoose object

      if (!user) throw new Error("Email chưa được đăng ký!");

      if (user.verifyState === "false")
        throw new Error(
          "Tài khoản chưa được xác minh. Vui lòng xác minh email của bạn.!"
        );

      // Kiểm tra Mật khẩu
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) throw new Error("Mật khẩu không hợp lệ!");

      // Tạo AccessToken và RefreshToken
      const accessToken = await generateAccessToken(user);
      const refreshToken = generateRefreshToken(user._id);

      // Cập nhật refresh_token nếu thay đổi
      if (user.refresh_token !== refreshToken.token) {
        await User.updateOne(
          { _id: user._id },
          {
            refresh_token: refreshToken.token,
            refresh_token_expiry: refreshToken.expiry,
          }
        );
      }

      return { access_token: accessToken, refresh_token: refreshToken.token };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

// 3. Hàm làm mới token
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || "defaultsecretkey"
    );
    const user = await User.findById(decoded.id).lean();

    if (
      !user ||
      user.refresh_token !== refreshToken ||
      user.refresh_token_expiry < Date.now()
    ) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user);

    return { access_token: newAccessToken };
  } catch (error) {
    throw new Error("Failed to refresh token");
  }
};
// 4.1 Hàm tạo OTP
const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000)); // OTP 6 chữ số
};

// 4. Hàm quên mật khẩu
const forgotPasswordUser = async (email) => {
  try {
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 6 * 1000); // OTP hết hạn trong 10 phút

    // Cập nhật opt và thời gian hết hạn vào cơ sở dữ liệu
    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { new: true }
    );

    // Kiểm tra user
    if (user) {
      await sendOtpEmail(email, otp);
      return { error: 0, message: "OTP has been sent via email successfully." };
    } else {
      return { error: 1, message: "No user found with this email." };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send OTP");
  }
};

// 5. Hàm xác nhận OTP
const verifyOTPUser = async (email, otpInput) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return { error: 1, message: "User not found." };
    }

    const { otp, otpExpiry } = user;

    // Kiểm tra OTP có khớp và còn hạn không
    if (!otp || !otpExpiry) {
      return { error: 1, message: "OTP not set or has expired." };
    }

    if (otp !== otpInput) {
      return { error: 1, message: "OTP is invalid." };
    }

    if (new Date().now > new Date(otpExpiry)) {
      console.log("Current Time: ", new Date());
      console.log("OTP Expiry Time: ", new Date(otpExpiry));
      return { error: 1, message: "OTP has expired." };
    }

    // Nếu OTP hợp lệ
    return { error: 0, message: "OTP hợp lệ" };
  } catch (error) {
    console.log(error);
    throw new Error("Error when confirming OTP.");
  }
};

// 6. Hàm đặt lại mật khẩu sau khi xác nhận OTP
const resetPasswordUser = async (email, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Mã hóa mật khẩu mới
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword, otp: null, otpExpiry: null }, // Xóa OTP sau khi sử dụng
      { new: true }
    );

    if (user) {
      return {
        error: 0,
        message: "Mật khẩu được cập nhật thành công!",
        data: user,
      };
    } else {
      return { error: 1, message: "Password reset failed." };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error resetting password.");
  }
};

// 7. Hàm xác thực tài khoản
const verifyAccountUser = async (email) => {
  try {
    // Tìm user
    const user = await User.findOneAndUpdate(
      { email, verifyState: false },
      { verifyState: true }, // cập nhật trạng thái verifyAccount
      { new: true }
    );

    // Nếu không có user thì thông báo lỗi
    if (!user) {
      return {
        error: 1,
        message:
          "Verify Account Failed. No matching user found or already verified.",
      };
    }

    return {
      error: 0,
      message: "Verify Account Successfully!",
      data: user,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error verifying account");
  }
};

// 8. Hàm đổi mật khẩu
const changePasswordUser = async (userId, oldPassword, newPassword) => {
  try {
    // Tìm kiếm user
    const user = await User.findById(userId);
    if (!user) {
      return {
        error: 1,
        message: "User not found.",
      };
    }

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return { error: 1, message: "Old password is incorrect." };
    }

    // Kiểm tra xem mật khẩu mới có trùng mật khẩu cũ không
    if (oldPassword === newPassword) {
      return {
        error: 1,
        message: "New password cannot be the same as old password.",
      };
    }

    // Mã hóa mật khẩu mới và cập nhật
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { error: 0, message: "Password changed successfully.", data: user };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      error: 1,
      message: "An error occurred while changing password. Please try again.",
    };
  }
};

module.exports = {
  registerUser,
  loginService,
  refreshAccessToken,
  forgotPasswordUser,
  verifyOTPUser,
  resetPasswordUser,
  verifyAccountUser,
  changePasswordUser,
};
