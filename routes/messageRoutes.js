const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authenticateToken = require("../middleware/authMiddleware");

// 🟢 Gửi tin nhắn từ User đến Admin
router.post("/", authenticateToken, messageController.sendMessage);

// 🟢 Admin trả lời User
router.post("/reply", authenticateToken, messageController.replyToUser);

// 🟢 Lấy danh sách tin nhắn giữa User và Admin
router.get("/", authenticateToken, messageController.getMessages);

// 🟢 Đánh dấu tin nhắn đã đọc
router.put("/:messageId/read", authenticateToken, messageController.markAsRead);

module.exports = router;
