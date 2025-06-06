const Message = require("../models/messageModel");

// 🟢 Gửi tin nhắn
const sendMessage = async (senderId, receiverId, message) => {
  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn:", error.message);
    throw new Error("Không thể gửi tin nhắn: " + error.message);
  }
};

// 🟢 Lấy tin nhắn giữa hai user
const getMessages = async (userId1, userId2) => {
  try {
    return await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ createdAt: 1 });
  } catch (error) {
    console.error("❌ Lỗi lấy tin nhắn:", error.message);
    throw new Error("Không thể lấy tin nhắn.");
  }
};

// 🟢 Đánh dấu tin nhắn đã đọc
const markAsRead = async (messageId) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );
    return updatedMessage;
  } catch (error) {
    console.error("❌ Lỗi cập nhật trạng thái tin nhắn:", error.message);
    throw new Error("Không thể cập nhật trạng thái tin nhắn.");
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
};
