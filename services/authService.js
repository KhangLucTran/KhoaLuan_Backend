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

// 1. Hàm đăng ký người dùng (Update)
const registerService = async ({
  email,
  password,
  username,
  numberphone,
  provider,
  addressData = null,
}) => {
  try {
    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) throw new Error("Email đã tồn tại!");

    // Mã hóa mật khẩu nhanh chóng
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Truy vấn role mặc định một lần
    const roleR3 = await Role.findOne({ code: "R3" }).select("_id").lean();
    if (!roleR3) {
      console.log("❌ Lỗi: Không thể kết nối đến cơ sở dữ liệu!");
      throw new Error(
        "Không tìm thấy vai trò mặc định 'Người dùng R3'. Vui lòng khởi tạo vai trò."
      );
    }

    // Nếu có địa chỉ, tạo Address
    const addressPromise = addressData
      ? Address.create({
          addressLine: addressData.addressLine,
          province: addressData.province,
          district: addressData.district,
          ward: addressData.ward,
        })
      : null;

    // Tạo Profile trước để lấy _id
    const newProfile = await Profile.create({
      username,
      numberphone,
      address: null,
    });

    // Tạo User và (nếu có) Address song song
    const [address, newUser] = await Promise.all([
      addressPromise,
      User.create({
        email,
        password: hashedPassword,
        profileId: newProfile._id,
        role_code: roleR3._id,
        provider: provider || "system",
      }),
    ]);

    // Nếu có Address, cập nhật vào Profile
    if (address) {
      await Profile.findByIdAndUpdate(newProfile._id, { address: address._id });
    }

    // Tạo Cart ngay sau khi có User
    await Cart.create({
      user: newUser._id,
      items: [],
      totalAmount: 0,
    });

    // Tạo AccessToken & RefreshToken song song
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(newUser),
      generateRefreshToken(newUser._id),
    ]);

    // Lưu refreshToken vào User
    await User.findByIdAndUpdate(newUser._id, {
      refresh_token: refreshToken.token,
      refresh_token_expiry: refreshToken.expiry,
    });

    console.log("✅ Thành công: User đã được tạo!");
    return {
      userId: newUser._id,
      profileId: newProfile._id,
      access_token: accessToken,
      refresh_token_expiry: refreshToken.expiry,
      refresh_token: refreshToken.token,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 2. Hàm đăng nhập người dùng (Uppdate)
const loginService = {
  async login(email, password) {
    try {
      const user = await User.findOne({ email })
        .select(
          "password verifyState role_code profileId refresh_token refresh_token_expiry"
        )
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

      // Tạo AccessToken
      const accessToken = await generateAccessToken(user);
      // Lấy ngày hiện tại
      const dateNow = Date.now();
      let refreshTokenObj;

      // Kiểm tra refreshToken lưu trong user
      // nếu hết hạn thì updateToken mới
      if (
        !user.refresh_token ||
        !user.refresh_token_expiry ||
        user.refresh_token_expiry < dateNow
      ) {
        // Tạo ra refreshToken mới và lưu lại
        refreshTokenObj = generateRefreshToken(user._id);
        await User.updateOne(
          { _id: user._id },
          {
            refresh_token: refreshTokenObj.token,
            refresh_token_expiry: refreshTokenObj.expiry,
          }
        );
      } else {
        // nếu còn hạn thì không update RefreshToken.
        // Dùng refresh token hiện tại
        refreshTokenObj = {
          token: user.refresh_token,
          expiry: user.refresh_token_expiry,
        };
      }

      return {
        time_refresh: refreshTokenObj.expiry,
        access_token: accessToken,
        refresh_token: refreshTokenObj.token,
      };
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
      return { error: 0, message: "OTP đã được gửi qua email thành công." };
    } else {
      return {
        error: 1,
        message: "Không tìm thấy người dùng nào với email này.",
      };
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
      return { error: 1, message: "Tài khoản không tồn tại" };
    }

    const { otp, otpExpiry } = user;

    // Kiểm tra OTP có khớp và còn hạn không
    if (!otp || !otpExpiry) {
      return { error: 1, message: "OTP chưa được đặt hoặc đã hết hạn." };
    }

    if (otp !== otpInput) {
      return { error: 1, message: "OTP không hợp lệ." };
    }

    if (new Date().now > new Date(otpExpiry)) {
      console.log("Current Time: ", new Date());
      console.log("OTP Expiry Time: ", new Date(otpExpiry));
      return { error: 1, message: "OTP đã hết hạn" };
    }

    // Nếu OTP hợp lệ
    return { error: 0, message: "OTP hợp lệ" };
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi khi xác nhận OTP   ");
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
      return { error: 1, message: "Đặt lại mật khẩu không thành công" };
    }
  } catch (error) {
    console.log(error);
    throw new Error("Lỗi đặt lại mật khẩu.");
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

// 9. Đăng nhập với Google
const handleGoogleStrategy = async (
  accessToken,
  refreshToken,
  profile,
  done
) => {
  try {
    if (!profile.emails || profile.emails.length === 0) {
      return done(new Error("Không tìm thấy email từ Google"));
    }

    const email = profile.emails[0].value;
    const avatar = profile.photos?.[0]?.value || null;
    const googleId = profile.id;

    console.log("Google OAuth Login - Email:", email);

    // Tìm người dùng theo email
    let user = await User.findOne({ email }).populate("profileId").lean();

    if (!user) {
      console.log("Không tìm thấy user, tạo mới...");

      // Đăng ký user mới
      const newUserData = await registerService({
        email,
        password: "googleAuth", // OAuth không cần password
        username: profile.displayName || "Google User",
        provider: "google",
      });

      if (newUserData.error) {
        console.error("Lỗi tạo user từ Google OAuth:", newUserData.error);
        return done(new Error(newUserData.error));
      }

      // Lấy thông tin user vừa tạo
      user = await User.findById(newUserData.userId)
        .populate("profileId")
        .lean();

      // Cập nhật avatar cho Profile nếu có
      if (avatar) {
        await Profile.findByIdAndUpdate(newUserData.profileId, { avatar });
      }

      console.log("User mới được tạo từ Google OAuth:", user);
    } else {
      // Nếu user đã tồn tại, cập nhật avatar nếu chưa có
      if (avatar && !user.profileId?.avatar) {
        await Profile.findByIdAndUpdate(user.profileId._id, { avatar });
      }
    }

    return done(null, user);
  } catch (error) {
    console.error("Google Auth Strategy Error:", error);
    return done(error);
  }
};

module.exports = {
  registerService,
  loginService,
  refreshAccessToken,
  forgotPasswordUser,
  verifyOTPUser,
  resetPasswordUser,
  verifyAccountUser,
  changePasswordUser,
  handleGoogleStrategy,
};
