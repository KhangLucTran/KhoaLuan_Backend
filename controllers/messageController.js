const messageService = require("../services/messageService");

// 🟢 Gửi tin nhắn
const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body; // ✅ Thêm receiver
    const senderId = req.user._id;
    if (!receiver || !message) {
      return res.status(400).json({ error: "Thiếu receiver hoặc message" });
    }

    const newMessage = await messageService.sendMessage(
      senderId,
      receiver,
      message
    );
    req.app.get("io").to(receiver).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Lỗi gửi tin nhắn:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Admin trả lời User
const replyToUser = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const adminId = req.user._id;
    if (!userId || !message) {
      return res
        .status(400)
        .json({ error: "Thiếu userId hoặc nội dung tin nhắn" });
    }

    const newMessage = await messageService.sendMessage(
      adminId,
      userId,
      message
    );
    req.app.get("io").to(userId).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Lấy tin nhắn giữa User và Admin
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const adminId = "67bc56f2c552de3a78a3a196";
    const messages = await messageService.getMessages(userId, adminId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Đánh dấu tin nhắn đã đọc
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const updatedMessage = await messageService.markAsRead(messageId);
    req.app.get("io").emit("messageRead", updatedMessage);
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMessage, replyToUser, getMessages, markAsRead };
