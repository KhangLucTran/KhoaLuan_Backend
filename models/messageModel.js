const mongoose = require("mongoose");
const { Schema } = mongoose;

// Định nghĩa schema cho Message
const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Người gửi là bắt buộc
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Người nhận là bắt buộc (phải là admin)
    },
    message: {
      type: String,
      required: true, // Nội dung tin nhắn là bắt buộc
    },
    isRead: {
      type: Boolean,
      default: false, // Mặc định tin nhắn chưa đọc
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt & updatedAt
  }
);

// Middleware kiểm tra receiver có phải Admin không
messageSchema.pre("save", async function (next) {
  try {
    const adminUser = await mongoose
      .model("User")
      .findById(this.receiver)
      .populate("role_code");

    if (!adminUser || adminUser.role_code.code !== "R1") {
      return next(new Error("Receiver must be an Admin (R1)."));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Xuất model Message
module.exports = mongoose.model("Message", messageSchema);
