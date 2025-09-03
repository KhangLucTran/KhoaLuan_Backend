const Notification = require("../models/notificationModel");
const {
  emitNotification,
  emitGlobalNotification,
} = require("../config/socketHandler");

// Gửi thông báo đến cho người dùng
const createNotification = async ({
  user,
  title,
  message,
  isGlobal,
  type,
  orderId,
  productId,
  invoiceId,
  relatedUserId,
  metadata,
}) => {
  const newNotification = await Notification.create({
    user: isGlobal ? null : user,
    title,
    message,
    isGlobal,
    type,
    orderId,
    productId,
    invoiceId,
    relatedUserId,
    metadata,
  });

  if (isGlobal) {
    emitGlobalNotification(newNotification);
  } else {
    emitNotification(user, newNotification);
  }

  return newNotification;
};

// Lấy thông báo của người dùng theo id
const getUserNotifications = async (userId) => {
  return await Notification.find({
    $or: [{ user: userId }, { isGlobal: true }],
  })
    .sort({ isRead: 1, createdAt: -1 }) // Ưu tiên chưa đọc
    .limit(50)
    .lean();
};

// Đánh dấu thông báo là đã đọc
const markNotificationAsRead = async (id, userId) => {
  const result = await Notification.updateOne(
    { _id: id, user: userId },
    { isRead: true }
  );
  return result.matchedCount > 0;
};

// Đánh dấu tất cả thông báo là đã đọc
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

// Lấy số lượng thông báo chưa đọc của người dùng
const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
};
