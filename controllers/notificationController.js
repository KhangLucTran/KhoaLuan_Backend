const notificationService = require("../services/notificationService");

/**
 * 📌 API: Lấy danh sách thông báo của user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId" });
    }

    const notifications = await notificationService.getUserNotifications(
      userId
    );
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Lỗi lấy thông báo:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/**
 * 📌 API: Đánh dấu thông báo là đã đọc
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Thiếu notificationId" });
    }

    const updatedNotification =
      await notificationService.markNotificationAsRead(id);
    if (!updatedNotification) {
      return res.status(404).json({ error: "Không tìm thấy thông báo" });
    }

    res.status(200).json({ message: "Thông báo đã đọc" });
  } catch (error) {
    console.error("❌ Lỗi đánh dấu thông báo:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/**
 * 📌 API: Gửi thông báo khi admin thêm sản phẩm mới
 */
exports.notifyNewProduct = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Thiếu tiêu đề sản phẩm" });
    }

    await notificationService.notifyNewProduct(title);
    res.status(201).json({ message: "Thông báo đã gửi" });
  } catch (error) {
    console.error("❌ Lỗi gửi thông báo sản phẩm mới:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/**
 * 📌 API: Gửi thông báo khi admin tạo đơn hàng
 */
exports.notifyNewOrder = async (req, res) => {
  try {
    console.log("📩 Dữ liệu nhận được:", req.body); // Debug

    const { orderId, userId } = req.body;
    if (!orderId || !userId) {
      return res.status(400).json({ error: "Thiếu orderId hoặc userId" });
    }

    await notificationService.notifyNewOrder(orderId, userId);
    res.status(201).json({ message: "Thông báo đã gửi" });
  } catch (error) {
    console.error("❌ Lỗi gửi thông báo đơn hàng:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

/**
 * 📌 API: Gửi thông báo khi admin chỉnh sửa đơn hàng
 */
exports.notifyOrderUpdate = async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    if (!orderId || !userId) {
      return res.status(400).json({ error: "Thiếu orderId hoặc userId" });
    }

    await notificationService.notifyOrderUpdate(orderId, userId);
    res.status(201).json({ message: "Thông báo đã gửi" });
  } catch (error) {
    console.error("❌ Lỗi gửi thông báo cập nhật đơn hàng:", error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};
