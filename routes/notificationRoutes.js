const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, controller.sendNotification);
router.get("/", authenticateToken, controller.getNotifications);
router.get("/unread-count", authenticateToken, controller.getUnreadCount);
router.patch("/:id/read", authenticateToken, controller.markAsRead);
router.patch("/mark-all", authenticateToken, controller.markAllAsRead);

module.exports = router;
