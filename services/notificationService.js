const Notification = require("../models/notificationModel");
const { io } = require("./../app");

/**
 * 📌 Tạo và gửi thông báo real-time
 * @param {Object} data - Dữ liệu thông báo
 */
const sendNotification = async (data) => {
  const notification = await Notification.create(data);

  if (io) {
    io.emit("new_notification", notification);
  } else {
    console.warn("⚠️ Không thể gửi thông báo: io chưa được khởi tạo.");
  }

  return notification;
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
const notifyNewProduct = async (title) => {
  return await sendNotification({
    message: `🆕 Sản phẩm mới: ${title} đã được thêm!`,
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
const notifyOrderUpdate = async (orderId, userId, message, type) => {
  return await sendNotification({
    user: userId,
    orderId,
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
