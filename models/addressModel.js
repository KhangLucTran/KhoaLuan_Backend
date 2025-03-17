const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new mongoose.Schema({
  // Tham chiếu đến model Address (liên kết với hồ sơ của người dùng)
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  province: {
    type: String, // Thay ObjectId bằng String
    required: [true], // Vẫn yêu cầu nhập tỉnh
  },
  district: {
    type: String, // Thay ObjectId bằng String
    required: [true], // Vẫn yêu cầu nhập quận
  },
  ward: {
    type: String,
    required: [true],
  },
  detail: {
    type: String, // Chi tiết địa chỉ
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false, // Địa chỉ mặc định, chỉ 1 địa chỉ của user có thể là true
  },
  createdAt: {
    type: Date,
    default: Date.now, // Tự động thêm thời gian tạo
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Tự động thêm thời gian cập nhật
  },
});

module.exports = mongoose.model("Address", addressSchema);
