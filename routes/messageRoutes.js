const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const authenticateToken = require("../middleware/authMiddleware");

// 🟢 Gửi tin nhắn giữa User và Admin
router.post("/", authenticateToken, messageController.sendMessage);

// 🟢 Lấy danh sách tin nhắn giữa 2 người
router.get("/:otherUserId", authenticateToken, messageController.getMessages);

// 🟢 Đánh dấu tin nhắn đã đọc
router.put("/:messageId/read", authenticateToken, messageController.markAsRead);

module.exports = router;
