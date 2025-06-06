const Notification = require("../models/notificationModel");
const Message = require("../models/messageModel");

let ioGlobal = null;

const socketHandler = (io) => {
  ioGlobal = io;

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(userId.toString());
      console.log(`🔌 Socket ${socket.id} đã tham gia phòng ${userId}`);
    }

    // Xử lí khi gửi tin nhắn
    // Xử lý nhận tin nhắn riêng tư
    socket.on("privateMessage", async ({ from, to, message }) => {
      const chatMessage = {
        sender: from,
        receiver: to,
        message,
      };

      try {
        const savedMessage = await Message.create(chatMessage);

        io.to(to.toString()).emit("privateMessage", {
          ...chatMessage,
          _id: savedMessage._id,
          timestamp: savedMessage.createdAt,
        });

        console.log(`💬 Tin nhắn từ ${from} đến ${to}: ${message}`);
      } catch (error) {
        console.error("❌ Gửi tin nhắn thất bại:", error.message);
        socket.emit("errorMessage", {
          error: "Gửi tin nhắn thất bại: " + error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket ${socket.id} đã ngắt kết nối`);
    });
  });
};

// Gửi thông tin update
// Gửi cập nhật trạng thái hóa đơn đến 1 user cụ thể
const emitInvoiceStatus = (userId, invoice) => {
  if (ioGlobal && userId) {
    ioGlobal.to(userId.toString()).emit("invoiceStatusUpdated", invoice);
    console.log(`📦 Gửi trạng thái hóa đơn mới cho user ${userId}`);
  }
};

// Chat
//Gửi tin nhắn riêng đến 1 user cụ thể
const emitPrivateMessage = (userId, message) => {
  if (ioGlobal && userId) {
    ioGlobal.to(userId.toString()).emit("privateMessage", message);
    console.log(`💬 Gửi tin nhắn đến ${userId}`);
  }
};

// Notification
// Emit đến 1 user cụ thể
const emitNotification = (userId, notification) => {
  if (ioGlobal && userId) {
    ioGlobal.to(userId.toString()).emit("newNotification", notification);
    console.log(`📨 Gửi thông báo cho user ${userId}`);
  }
};

// Emit cho toàn bộ hệ thống
const emitGlobalNotification = (notification) => {
  if (ioGlobal) {
    ioGlobal.emit("newNotification", notification);
    console.log(`📨 Gửi thông báo toàn hệ thống`);
  }
};

// Gửi nhiều thông báo 1 lúc (ví dụ: Admin gửi cho nhiều user)
const emitBulkNotifications = (userIds, notification) => {
  if (ioGlobal && Array.isArray(userIds)) {
    userIds.forEach((id) => {
      ioGlobal.to(id.toString()).emit("newNotification", notification);
      console.log(`📨 Gửi thông báo bulk tới ${id}`);
    });
  }
};

module.exports = {
  socketHandler,
  emitNotification,
  emitGlobalNotification,
  emitBulkNotifications,
  emitPrivateMessage,
  emitInvoiceStatus,
};
