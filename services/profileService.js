const Profile = require("../models/profileModel");
const Address = require("../models/addressModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;
const { deleteImageFromCloudinary } = require("../middleware/cloudinary");

// 1. Lấy tất cả hồ sơ
const getAllProfiles = async () => {
  return await Profile.find().populate("address");
};

// 2. Lấy hồ sơ theo ID
const getProfileById = async (id) => {
  return await Profile.findById(id).populate("address");
};

// 3. Tạo hồ sơ mới
const createProfile = async (profileData) => {
  return await Profile.create(profileData);
};

// 4. Hàm upload ảnh lên Cloudinary
const uploadImageToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "avatars", // Lưu ảnh trong thư mục 'avatars'
      use_filename: true, // Sử dụng tên file gốc
      unique_filename: false, // Không thêm chuỗi ngẫu nhiên vào tên file
    });
    return result.secure_url; // Trả về URL của ảnh
  } catch (error) {
    throw new Error("Lỗi khi upload ảnh lên Cloudinary: " + error.message);
  }
};
// 5. Hàm cập nhật ảnh đại diện
const updateAvatar = async (profileId, file) => {
  try {
    const profile = await Profile.findById(profileId);
    if (!profile) throw new Error("Profile not found");

    // Xóa ảnh cũ trên Cloudinary nếu có
    if (profile.avatar) {
      await deleteImageFromCloudinary(profile.avatar);
    }

    // Upload ảnh mới
    const imageUrl = await uploadImageToCloudinary(file);
    profile.avatar = imageUrl;
    await profile.save();

    return profile.avatar;
  } catch (error) {
    throw new Error("Error updating avatar: " + error.message);
  }
};

// 6. Xóa hồ sơ
const deleteProfile = async (id) => {
  return await Profile.findByIdAndDelete(id);
};

// 7. Hàm updateProfile
const updateUserProfile = async (profileId, body) => {
  try {
    const {
      username,
      mobilePhone,
      birthday,
      gender,
      province,
      district,
      addressDetail,
    } = body;

    // Tìm profile bằng profileId (đã có trong req.user từ token)
    const profile = await Profile.findOne({ _id: profileId });

    // Nếu không tìm thấy profile, ném lỗi
    if (!profile) {
      throw new Error("Profile không tìm thấy.");
    }

    // Tạo hoặc cập nhật địa chỉ nếu có thay đổi
    let updatedAddress = null;
    if (province || district || addressDetail) {
      if (profile.address) {
        // Nếu đã có địa chỉ, cập nhật
        updatedAddress = await Address.findOneAndUpdate(
          { _id: profile.address },
          { province, district, detail: addressDetail },
          { new: true }
        );
      } else {
        // Nếu chưa có địa chỉ, tạo mới
        updatedAddress = await Address.create({
          province,
          district,
          detail: addressDetail,
        });
      }
    }

    // Cập nhật các trường còn lại của profile
    profile.username = username || profile.username;
    profile.numberphone = mobilePhone || profile.numberphone;
    profile.dob = birthday || profile.dob;
    profile.gender = gender || profile.gender;
    if (updatedAddress) {
      profile.address = updatedAddress._id;
    }

    // Lưu profile đã cập nhật
    const updatedProfile = await profile.save();

    // Trả về profile đã được cập nhật
    return updatedProfile;
  } catch (error) {
    console.error("Lỗi khi cập nhật hồ sơ:", error);
    throw error; // Để lỗi được bắt ở controller
  }
};

// 8. Hàm xóa ảnh Avatar
const deleteAvatar = async (profileId) => {
  try {
    const profile = await Profile.findById(profileId);
    if (!profile) throw new Error("Profile not found");

    if (!profile.avatar) throw new Error("No avatar to delete");

    // Xóa ảnh trên Cloudinary
    await cloudconfig.deleteImageFromCloudinary(profile.avatar);

    // Xóa avatar trong DB (đặt về ảnh mặc định hoặc null)
    profile.avatar = null;
    await profile.save();
  } catch (error) {
    throw new Error("Error deleting avatar: " + error.message);
  }
};

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateUserProfile,
  updateAvatar,
  deleteProfile,
  deleteAvatar,
};
