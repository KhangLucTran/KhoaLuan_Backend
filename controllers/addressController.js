const addressService = require("../services/addressService");

// Lấy tất cả địa chỉ
const getAllAddresses = async (req, res) => {
  try {
    const addresses = await addressService.getAllAddresses();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy địa chỉ theo ID
const getAddressById = async (req, res) => {
  try {
    const address = await addressService.getAddressById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo địa chỉ mới
const createAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const newAddress = req.body;
    const result = await addressService.createAddress(newAddress, userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật địa chỉ
const updateAddress = async (req, res) => {
  try {
    const updatedAddress = await addressService.updateAddress(
      req.params.id,
      req.body
    );
    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const deletedAddress = await addressService.deleteAddress(req.params.id);
    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả địa chỉ theo userId
const getAllAddressByUserId = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await addressService.getAllAddressByUserId(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy địa chỉ của userId có isDefault ;à true
const getAllAddressisDefault = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await addressService.getAllAddressisDefault(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đặt đỉa chỉ thành mặc định
const setDefaultAddressController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Giả định userId có trong req.user
    const updatedAddress = await addressService.setDefaultAddress(id, userId);
    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddressController,
  getAllAddressByUserId,
  getAllAddressisDefault,
};
