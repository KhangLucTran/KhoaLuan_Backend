const messageService = require("../services/messageService");

// 🟢 Gửi tin nhắn (User hoặc Admin)
const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const senderId = req.user._id;

    if (!receiver || !message) {
      return res.status(400).json({ error: "Thiếu receiver hoặc message" });
    }

    const newMessage = await messageService.sendMessage(
      senderId,
      receiver,
      message
    );
    req.app
      .get("io")
      .to(receiver.toString())
      .emit("privateMessage", {
        ...newMessage.toObject(),
      });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Lỗi gửi tin nhắn:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Lấy tin nhắn giữa 2 người bất kỳ (User và Admin)
const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await messageService.getMessages(
      currentUserId,
      otherUserId
    );
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Lỗi lấy tin nhắn:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🟢 Đánh dấu tin nhắn đã đọc
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const updatedMessage = await messageService.markAsRead(messageId);

    req.app
      .get("io")
      .to(updatedMessage.sender.toString())
      .emit("messageRead", updatedMessage);
    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("❌ Lỗi đánh dấu đã đọc:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
};
