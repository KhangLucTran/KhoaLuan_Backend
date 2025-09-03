const express = require("express");
const router = express.Router();
const searchHistoryController = require("../controllers/searchHistoryController");
const authenticateToken = require("../middleware/authMiddleware");

// API thêm keyword
router.post(
  "/",
  authenticateToken,
  searchHistoryController.addKeywordsController
);

module.exports = router;
