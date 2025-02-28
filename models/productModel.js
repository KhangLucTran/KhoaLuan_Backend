const mongoose = require("mongoose");
const { Schema } = mongoose;

// Định nghĩa schema cho Product
const productSchema = new Schema(
  {
    // Tên sản phẩm
    title: {
      type: String,
      required: true,
    },

    // Danh sách ảnh sản phẩm
    images: {
      type: [String], // Mảng các URL ảnh
      required: true,
    },

    // Giá sản phẩm
    price: {
      type: Number,
      required: true,
    },

    // Các size có sẵn cho sản phẩm
    sizes: {
      type: [String],
      enum: ["S", "M", "L", "XL"],
      default: ["S", "M", "L", "XL"], // Mặc định là có đủ 4 size
    },

    // Các màu sắc có sẵn cho sản phẩm
    colors: {
      type: [String],
      enum: ["Green", "Red", "Blue"],
      default: ["Green", "Red", "Blue"], // Mặc định có 3 màu sắc
    },

    // Chi tiết sản phẩm
    description: {
      type: String,
      required: true,
    },

    // Số lượng sản phẩm còn trong kho
    stock: {
      type: Number,
      required: true,
    },

    // Thể loại sản phẩm (Ví dụ: Quần, Áo, Nón)
    category: {
      type: String,
      required: true,
      enum: ["Shirt", "Pants", "Hat"], // Đảm bảo chỉ có thể là các giá trị này
    },

    // Giới tính
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

// Xuất model Product
module.exports = mongoose.model("Product", productSchema);
