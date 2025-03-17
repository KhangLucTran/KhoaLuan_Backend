const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Address = require("..//models/addressModel");
const Role = require("../models/roleModel");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../config/tokenUtils");
const {
  sendNotification,
  notifyOrderUpdate,
} = require("../services/notificationService");
/**
 * Hàm lấy thông tin người dùng hiện đang đăng nhập từ token
 * @param {String} token - Token JWT
 * @returns {Object} - Thông tin người dùng
 */

// 1. Hàm lấy thông tin của user đang đăng nhập
const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .populate("profileId")
    .populate("role_code");
  if (!user) {
    throw new Error("Không tìm thấy user hiện tại!");
  }
  return user;
};
// 1. Hàm lấy thông tin của user đang đăng nhập
const getUserByIdNo_Code = async (userId) => {
  const user = await User.findById(userId).populate("profileId");
  if (!user) {
    throw new Error("Không tìm thấy user hiện tại!");
  }
  return user;
};
// 2. Hàm chỉnh sửa thông tin user
const updateUser = async (userId, updateData) => {
  // Tìm người dùng theo ID
  const user = await User.findById(userId).populate("profileId");
  console.log("Dữ liệu mới của User:", updateData);
  if (!user) {
    throw new Error("Không tìm thấy user hiện tại!");
  }

  // Cập nhật thông tin người dùng
  user.email = updateData.email || user.email; // Cập nhật email nếu có
  user.profileId.username = updateData.username || user.profileId.username; // Cập nhật username nếu có
  user.profileId.address = updateData.address || user.profileId.address; // Cập nhật địa chỉ nếu có
  user.profileId.gender = updateData.gender || user.profileId.gender;
  user.profileId.dob = updateData.dob || user.profileId.dob;
  user.profileId.numberphone =
    updateData.numberphone || user.profileId.numberphone; // Cập nhật số điện thoại nếu có

  // Lưu thông tin đã chỉnh sửa
  await user.profileId.save(); // Lưu thay đổi cho profile
  await user.save(); // Lưu thay đổi cho user

  // Trả về thông tin người dùng đã cập nhật, bỏ các thuộc tính không cần thiết
  const { password, createdAt, updatedAt, ...profileData } =
    user.profileId._doc; // Sử dụng _doc để lấy dữ liệu raw

  // Gửi thông báo người dùng chỉnh sửa dữ liệu thành công
  await notifyOrderUpdate(
    null,
    userId,
    "✨ Hồ sơ của bạn vừa được nâng cấp!",
    "user"
  );

  return {
    _id: user._id,
    email: user.email,
    provider: user.provider,
    verifyState: user.verifyState,
    profileId: profileData, // Chỉ giữ lại thông tin profile đã cập nhật
    role_code: user.role_code,
    refresh_token: user.refresh_token,
    refresh_token_expiry: user.refresh_token_expiry,
  };
};

// 3. Hàm lấy thông tin tất cả Users
const getAllUsersByAdmin = async (req, res) => {
  const users = await User.find().populate("profileId").populate("role_code");
  return users;
};

// 4. Hàm xóa user theo id
const deleteUserById = async (userId) => {
  try {
    // Tìm người dùng theo ID
    const user = await User.findById(userId).populate("profileId");
    if (!user) {
      throw new Error("User not found");
    }

    // Nếu có profileId, tìm và xóa profile
    if (user.profileId) {
      // Tìm hồ sơ để lấy thông tin địa chỉ
      const profile = await Profile.findById(user.profileId._id).populate(
        "address"
      );

      // Xóa địa chỉ nếu tồn tại
      if (profile && profile.address) {
        const addressDeleted = await Address.findByIdAndDelete(
          profile.address._id
        );
        if (!addressDeleted) {
          console.log("Address not found or could not be deleted.");
        }
      }

      // Xóa hồ sơ
      const profileDeleted = await Profile.findByIdAndDelete(profile._id);
      if (!profileDeleted) {
        console.log("Profile could not be deleted.");
      }
    }

    // Xóa người dùng
    const userDeleted = await User.findByIdAndDelete(userId);
    if (!userDeleted) {
      console.log("User could not be deleted.");
    }

    return user;
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

// 5. Hàm tạo user của Admin
const createUserByAdmin = async (userCreate) => {
  // Kiểm tra email có tồn tại chưa
  const email = userCreate.email;
  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Password mặc định là "123456"
  const hashedPassword = await bcrypt.hash("123456", 10);
  const newProfile = await Profile.create({ username });

  // Tạo quyền cho user mới.
  const roleUser = userCreate.role_code || "R3-User"; // Mặc định là R3-User nếu không có role_code
  const role = await Role.findOne({ code: roleUser });
  if (!role) {
    throw new Error("Default role not found. Please initialize roles.");
  }

  const newUser = await User.create({
    email,
    password: hashedPassword,
    profileId: newProfile._id,
    role_code: role._id,
  });

  // Tạo accessToken và refreshToken
  const accessToken = await generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser._id);

  // Lưu lại refreshToken
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

module.exports = {
  deleteUserById,
  getAllUsersByAdmin,
  getUserById,
  updateUser,
  createUserByAdmin,
  getUserByIdNo_Code,
};
