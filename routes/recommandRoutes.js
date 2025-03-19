const express = require("express");
const router = express.Router();
const recommendController = require("../controllers/recommandController");
const authenticateToken = require("../middleware/authMiddleware");

// API lấy danh sách sản phẩm theo userId
router.get("/", authenticateToken, recommendController.getRecommendations);

// API lấy danh sách sản phẩm theo Content-base
router.get(
  "/content-base",
  authenticateToken,
  recommendController.getContentBase
);

// API lấy danh sách sản phẩm theo PersonalPersonalized
router.get("/personalized", recommendController.getPersonalized);

// API lấy danh sách sản phẩm theo Collaborative
router.get(
  "/collaborative",
  authenticateToken,
  recommendController.getCollaborative
);

module.exports = router;
