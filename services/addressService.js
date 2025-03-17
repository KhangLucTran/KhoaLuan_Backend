const Address = require("../models/addressModel");

// Lấy tất cả địa chỉ
const getAllAddresses = async () => {
  return await Address.find();
};

// Lấy địa chỉ theo ID
const getAddressById = async (id) => {
  return await Address.findById(id);
};

// Tạo địa chỉ mới
const createAddress = async (addressData, userId) => {
  const newAddress = new Address({ ...addressData, userId });
  return await Address.create(newAddress);
};

// Cập nhật địa chỉ
const updateAddress = async (id, addressData) => {
  return await Address.findByIdAndUpdate(id, addressData, { new: true });
};

// Xóa địa chỉ
const deleteAddress = async (id) => {
  return await Address.findByIdAndDelete(id);
};

// Lấy tất cả địa chỉ theo userId, ưu tiên địa chỉ mặc định lên đầu
const getAllAddressByUserId = async (userId) => {
  return await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
};

// Lấy tất cả địa chỉ theo userId, ưu tiên địa chỉ mặc định lên đầu
const getAllAddressisDefault = async (userId) => {
  return await Address.find({ userId, isDefault: true });
};

// Chỉnh sửa: đặt địa chỉ thành mặc định
const setDefaultAddress = async (id, userId) => {
  const session = await Address.startSession();
  session.startTransaction();

  try {
    await Address.updateMany(
      { userId },
      { $set: { isDefault: false } },
      { session }
    );
    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { isDefault: true },
      { new: true, session }
    );

    if (!updatedAddress) {
      throw new Error("Không tìm thấy địa chỉ cần cập nhật");
    }

    await session.commitTransaction();
    session.endSession();
    return updatedAddress;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  getAllAddressisDefault,
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  getAllAddressByUserId,
  deleteAddress,
  setDefaultAddress,
};
