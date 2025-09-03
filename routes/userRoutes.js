const express = require("express");
const router = express.Router();
const {
  getLoggedInUser,
  updateInforUser,
  getAllUsers,
  removeUser,
  createUser,
  getUserById,
  updateInforUserAdmin,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");

// API lấy thông tin người dùng đang đăng nhập (cần Token)
router.get("/me", authenticateToken, getLoggedInUser);
// API chỉnh sửa thông tin người dùng đang đăng nhập (cần Token)
router.put("/update/me", authenticateToken, updateInforUser);
// API chỉnh sửa thông tin người dùng đang đăng nhập (cần Token)
router.put("/admin/update", authenticateToken, updateInforUserAdmin);
// API quản lý người dùng, chỉ có Admin mới có quyền truy cập (cần xác nhận quyền Admin, cần Token)
router.get("/admin/users", authenticateToken, getAllUsers);
// API quản lý người dùng, chỉ có Admin mới có quyền truy cập (cần xác nhận quyền Admin, cần Token)
router.get("/get-users/:id", getUserById);
// API xóa người dùng theo id, chỉ có Admin mới có quyền truy cập (cần xác nhận quyền Admin, cần Token)
router.delete("/admin/delete/:id", authenticateToken, removeUser);
// API tạo người dùng, chỉ có Admin mới có quyền truy cập (cần xác nhận quyền Admin, cần Token)
router.post(
  "/admin/create-user",
  authenticateToken,
  authorizeAdmin,
  createUser
);

module.exports = router;
