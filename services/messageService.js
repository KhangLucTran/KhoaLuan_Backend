const Message = require("../models/messageModel");

// 🟢 Gửi tin nhắn
const sendMessage = async (senderId, receiverId, message) => {
  try {
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      isRead: false,
    });

    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn:", error);
    throw new Error("Không thể gửi tin nhắn, vui lòng thử lại.");
  }
};
// 🟢 Lấy danh sách tin nhắn giữa User và Admin
const getMessages = async (userId, adminId) => {
  try {
    return await Message.find({
      $or: [
        { sender: userId, receiver: adminId },
        { sender: adminId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
  } catch (error) {
    console.error("❌ Lỗi khi lấy tin nhắn:", error);
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
    console.error("❌ Lỗi khi cập nhật trạng thái tin nhắn:", error);
    throw new Error("Không thể cập nhật trạng thái tin nhắn.");
  }
};

module.exports = { sendMessage, getMessages, markAsRead };
