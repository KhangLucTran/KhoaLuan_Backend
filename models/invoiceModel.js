const { boolean } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const invoiceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressDetail: {
    type: String,
    reuire: true,
    default: "",
  },
  numberphone: {
    type: String,
    require: true,
    default: "",
  },

  status: {
    type: String,
    enum: ["Pending", "Paid", "Shipped", "Completed", "Cancelled"],
    default: "Pending",
  },
  statusTimeLine: [
    {
      status: {
        type: String,
        enum: ["Pending", "Paid", "Shipped", "Completed", "Cancelled"],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  totalAmount: {
    type: Number,
  },
  // 🔥 Lưu chi tiết LineItem
  lineItems: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: String, // Lưu tên sản phẩm
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
      size: String,
      color: String,
      gender: String,
      hasRated: { type: Boolean, default: false },
    },
  ],
  paymentMethod: String,
  // 🔥 Lưu thông tin giao dịch từ VNPAY
  vnp_TxnRef: String, // Mã đơn hàng
  vnp_TransactionNo: String, // Mã giao dịch
  vnp_BankCode: String, // Ngân hàng thanh toán
  vnp_PayDate: String, // Ngày thanh toán
  vnp_TransactionStatus: String, // Trạng thái giao dịch
});

module.exports = mongoose.model("Invoice", invoiceSchema);
