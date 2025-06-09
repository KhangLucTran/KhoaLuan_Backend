const Notification = require("../models/notificationModel");
const { app, io } = require("./../app");
const onlineUsers = require("../config/onlineUser");

const sendNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    const userSocketId = onlineUsers.getUserSocket(data.user);

    if (userSocketId) {
      io.to(userSocketId).emit("new_notification", notification);
      console.log(`📩 Đã gửi thông báo cho user ${data.user}`);
    } else {
      console.log(`⚠️ User ${data.user} không online.`);
    }

    return notification;
  } catch (error) {
    console.error("❌ Lỗi khi gửi thông báo:", error);
  }
};

/**
 * 📌 Lấy danh sách thông báo của một user
 * @param {String} userId - ID của user
 */
const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId })
    .populate("invoiceId")
    .sort({ createdAt: -1 });
};

/**
 * 📌 Đánh dấu một thông báo là đã đọc
 * @param {String} notificationId - ID của thông báo
 */
const markNotificationAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

/**
 * 📌 Gửi thông báo khi admin thêm sản phẩm mới
 * @param {String} title - Tên sản phẩm mới
 */
const notifyNewProduct = async (productId, message) => {
  return await sendNotification({
    productId,
    message,
    type: "product",
  });
};

/**
 * 📌 Gửi thông báo khi admin tạo đơn hàng
 * @param {String} orderId - ID đơn hàng
 * @param {String} userId - ID của người dùng nhận thông báo
 */
const notifyNewOrder = async (invoiceId, userId) => {
  const timestamp = new Date().toLocaleString("vi-VN");
  return await sendNotification({
    user: userId,
    invoiceId,
    message: `Đơn hàng #${invoiceId} của bạn đã được tạo lúc ${timestamp}.`,
    type: "invoice",
  });
};
/**
 * 📌 Gửi thông báo khi admin chỉnh sửa đơn hàng
 * @param {String} orderId - ID đơn hàng
 * @param {String} userId - ID của người dùng nhận thông báo
 */
const notifyOrderUpdate = async (orderId, userId, productId, message, type) => {
  return await sendNotification({
    user: userId,
    orderId,
    productId: productId,
    message: message,
    type: type,
  });
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  notifyNewProduct,
  notifyNewOrder,
  notifyOrderUpdate,
};
