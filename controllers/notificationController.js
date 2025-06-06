const notificationService = require("../services/notificationService");

exports.sendNotification = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    if (!isGlobal && !user) {
      return res
        .status(400)
        .json({ message: "Phải có user khi không phải thông báo toàn cục." });
    }

    const notification = await notificationService.createNotification({
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
    });

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi gửi thông báo." });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(
      req.user._id
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy thông báo." });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const updated = await notificationService.markNotificationAsRead(
      req.params.id,
      req.user._id
    );
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Không thể đánh dấu đã đọc." });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Không thể đánh dấu tất cả đã đọc." });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy số lượng chưa đọc." });
  }
};
