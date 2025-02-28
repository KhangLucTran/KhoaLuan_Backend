const mongoose = require("mongoose");
const { Schema } = mongoose;

const discountSchema = new Schema(
  {
    // Mã giảm giá (Không trùng lặp)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Giảm theo phần trăm (VD: 10%, 20%)
    percent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Giảm theo số tiền cố định (VD: 50.000đ)
    fixedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Áp dụng cho sản phẩm cụ thể (Quần, Áo, Nón)
    applicableProducts: {
      type: [String],
      enum: ["Shirt", "Pants", "Hat"],
      default: [],
    },

    // Miễn phí vận chuyển
    freeShipping: {
      type: Boolean,
      default: false,
    },

    // Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá
    minOrderAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Ngày bắt đầu & ngày kết thúc của mã giảm giá
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Giới hạn số lần sử dụng mã giảm giá
    usageLimit: {
      type: Number,
      min: 1,
      default: 100, // Mặc định 100 lần sử dụng
    },

    // Số lần đã sử dụng mã giảm giá
    usedCount: {
      type: Number,
      default: 0,
    },

    // Trạng thái mã giảm giá (Kích hoạt, Hết hạn, Bị vô hiệu hóa)
    status: {
      type: String,
      enum: ["Active", "Expired", "Disabled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware kiểm tra ngày hết hạn trước khi lưu
discountSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    return next(new Error("Ngày kết thúc phải lớn hơn ngày bắt đầu"));
  }
  next();
});

// Cập nhật trạng thái mã giảm giá khi hết hạn
discountSchema.pre("save", function (next) {
  if (this.endDate < Date.now()) {
    this.status = "Expired";
  }
  next();
});

// Xuất model Discount
module.exports = mongoose.model("Discount", discountSchema);
