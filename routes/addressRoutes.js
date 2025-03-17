const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const authenticateToken = require("../middleware/authMiddleware");

// Route lấy tất cả địa chỉ (Cần Token)
router.get("/", authenticateToken, addressController.getAllAddresses);

// Route lấy tất cả địa chỉ theo userId (Cần Token)
router.get(
  "/get-all",
  authenticateToken,
  addressController.getAllAddressByUserId
);

// Route lấy địa chỉ của userId có isDefault = true
router.get(
  "/get-all/isDefault",
  authenticateToken,
  addressController.getAllAddressisDefault
);

// Route lấy địa chỉ theo ID (Cần Token)
router.get("/:id", authenticateToken, addressController.getAddressById);

// Route tạo địa chỉ mới (Cần Token)
router.post("/", authenticateToken, addressController.createAddress);

// Route cập nhật địa chỉ (Cần Token)
router.put("/:id", authenticateToken, addressController.updateAddress);

// Route xóa địa chỉ (Cần Token)
router.delete("/:id", authenticateToken, addressController.deleteAddress);

// Route đặt địa chỉ làm mặc định
router.put(
  "/set-default/:id",
  authenticateToken,
  addressController.setDefaultAddressController
);

module.exports = router;
