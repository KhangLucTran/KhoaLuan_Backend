const mongoose = require("mongoose");
const { Schema } = mongoose;

// Định nghĩa schema cho LineItem
const lineItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
  gender: {
    type: String,
  },
});

// Tính tổng giá tự động trước khi lưu
lineItemSchema.pre("save", function (next) {
  this.total = this.quantity * this.price;
  next();
});

lineItemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // Ép kiểu quantity và price về số trước khi tính toán
  if (update.quantity) update.quantity = Number(update.quantity);
  if (update.price) update.price = Number(update.price);

  if (!isNaN(update.quantity) && !isNaN(update.price)) {
    update.total = update.quantity * update.price;
  }

  next();
});

// Xuất model LineItem
module.exports = mongoose.model("LineItem", lineItemSchema);
