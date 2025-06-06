const express = require("express");
const router = express.Router();
const optionalAuthenticateToken = require("../middleware/optionalAuthenticateToken");
const chatbotController = require("../controllers/chatbotController");

// Route POST để gửi message và nhận intent + reply
router.post(
  "/chatbot",
  optionalAuthenticateToken,
  chatbotController.chatbotReply
);

module.exports = router;
