const paymentService = require("../services/paymentService");

exports.createPayment = async (req, res) => {
  try {
    const paymentUrl = await paymentService.createPaymentUrl(req);
    res.redirect(paymentUrl);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi tạo thanh toán", error: error.message });
  }
};

exports.getOrderList = (req, res) => {
  res.render("orderlist", { title: "Danh sách đơn hàng" });
};

exports.createOrderPage = (req, res) => {
  const productId = req.params.productId;
  res.render("order", { title: "Tạo mới đơn hàng", productId });
};
