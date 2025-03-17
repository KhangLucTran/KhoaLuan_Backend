const express = require("express");
const {
  getNotifications,
  markAsRead,
  notifyNewProduct,
  notifyNewOrder,
  notifyOrderUpdate,
} = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getNotifications);
router.patch("/:id/read", authenticateToken, markAsRead);
router.post("/new-product", authenticateToken, notifyNewProduct);
router.post("/new-order", authenticateToken, notifyNewOrder);
router.post("/update-order", authenticateToken, notifyOrderUpdate);

module.exports = router;
