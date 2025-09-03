const { updateUser } = require("../services/userService");
const {
  getAllUsersByAdmin,
  deleteUserById,
  createUserByAdmin,
  getUserByIdNo_Code,
  updateUserByAdmin,
} = require("../services/userService");

/**
 * Controller để lấy thông tin người dùng hiện đang đăng nhập
 * @param {Object} req - Yêu cầu từ client
 * @param {Object} res - Phản hồi trả về client
 */

// Controller cho "lấy thông tin người dùng đang đăng nhập"
const getLoggedInUser = async (req, res) => {
  try {
    const user = req.user; // Lấy thông tin user đã được middleware authenticateToken gán vào req
    res.status(200).json({ error: 0, data: user });
  } catch (error) {
    res.status(500).json({ error: 1, message: "Error retrieving user info" });
  }
};

// Controller cho "chỉnh sửa thông tin người dùng đang dăng nhập"
const updateInforUser = async (req, res) => {
  try {
    const updateData = req.body; // Lấy thông tin mới từ body
    const userId = req.user._id; // Thông tin user._id từ middleware authenticateToken
    // Gọi hàm từ service để cập nhật thông tin người dùng
    const updatedUser = await updateUser(userId, updateData);

    res.status(200).json({
      error: 0,
      message: "User information updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: 1, message: error.message });
  }
};

// Contrtoller Chỉnh sửa thông tin người dùng của Admin
const updateInforUserAdmin = async (req, res) => {
  try {
    const { userId, updateData } = req.body;
    console.log({ userId, updateData });
    // Gọi hàm từ service để cập nhật thông tin người dùng
    const updatedUser = await updateUserByAdmin(userId, updateData);

    res.status(200).json({
      error: 0,
      message: "User information updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: 1, message: error.message });
  }
};

// Controller cho "lấy tất cả người dùng"
const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersByAdmin();
    res.status(200).json({
      error: 0,
      message: "Get All Users successfully",
      data: users,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách users:", error);
    res.status(500).json({ error: 1, message: "Error retrieving users" });
  }
};

// Controller cho "Xóa tài khoản người dùng"
const removeUser = async (req, res) => {
  const userId = req.params.id; // Lấy ID từ params
  try {
    const deletedUser = await deleteUserById(userId);
    res.status(200).json({
      error: 0,
      message: "User deleted successfully",
      data: deletedUser, // Có thể trả về thông tin người dùng đã xóa
    });
  } catch (error) {
    console.error("Delete User error: ", error);
    res.status(500).json({ error: 1, message: error.message });
  }
};

// Controller cho "Tạo user mới bởi Admin"
const createUser = async (req, res) => {
  try {
    const user = req.body;
    const userCreateByAdmin = await createUserByAdmin(user);
    res.status(200).json({
      error: 0,
      message: "Create user by Admin successfully!",
      data: userCreateByAdmin,
    });
  } catch (error) {
    console.error("Create user by Admin fail!: ", error);
    res.status(500).json({ error: 1, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await getUserByIdNo_Code(userId);
    res.status(200).json({
      error: 0,
      message: "Get User By Id Successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Get User By Id Fail: ", error);
    res.status(500).json({ error: 1, message: error.message });
  }
};
module.exports = {
  getAllUsers,
  getLoggedInUser,
  updateInforUser,
  removeUser,
  createUser,
  getUserById,
  updateInforUserAdmin,
};
