const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authenticateToken = require("../middleware/authMiddleware");
const { uploadCloud } = require("../middleware/cloudinary");

// Route lấy tất cả hồ sơ (Cần Token)
router.get("/", authenticateToken, profileController.getAllProfiles);
// Route lấy hồ sơ theo ID (Cần Token)
router.get("/:id", authenticateToken, profileController.getProfileById);
// Route tạo hồ sơ mới (Cần Token)
router.post("/", authenticateToken, profileController.createProfile);
// Route cập nhật hồ sơ (Cần Token)
router.put(
  "/update-avatar",
  authenticateToken,
  uploadCloud.single("avatar"),
  profileController.updateAvatar
);
// Route xóa ảnh avatar (Cần Token)
router.delete(
  "/delete-avatar",
  authenticateToken,
  profileController.deleteAvatar
);
// Route cập nhận thông tin profile (Cần Token)
router.post(
  "/update-profile",
  authenticateToken,
  profileController.updateProfile
);
// Route xóa hồ sơ (Cần Token)
router.delete("/:id", authenticateToken, profileController.deleteProfile);

module.exports = router;
