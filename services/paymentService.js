const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");
const mongoose = require("mongoose");
const Product = require("../models/productModel");
require("dotenv").config();

// Hàm sắp xếp object theo key
function sortObject(obj) {
  return Object.fromEntries(Object.entries(obj).sort());
}

exports.createPaymentUrl = async (req) => {
  const { productId, bankCode, locale } = req.body;
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const orderId = moment(date).format("DDHHmmss");

  // Kiểm tra ID sản phẩm hợp lệ
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("ID sản phẩm không hợp lệ");
  }

  // Lấy thông tin sản phẩm từ DB
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  const amount = product.price * 100; // Nhân 100 vì VNPAY yêu cầu đơn vị là đồng

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: process.env.vnp_TmnCode.trim(),
    vnp_Locale: locale || "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toán đơn hàng: ${orderId}`,
    vnp_OrderType: "other",
    vnp_Amount: amount,
    vnp_ReturnUrl: process.env.vnp_ReturnUrl.trim(),
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", process.env.vnp_HashSecret.trim());
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = `${process.env.vnp_Url.trim()}?${querystring.stringify(
    vnp_Params,
    { encode: false }
  )}`;
  return paymentUrl;
};
