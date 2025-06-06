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

// Middleware kiểm tra logic tin nhắn giữa người gửi và người nhận trước khi lưu vào DB
messageSchema.pre("save", async function (next) {
  try {
    const sender = await mongoose
      .model("User")
      .findById(this.sender)
      .populate("role_code");
    const receiver = await mongoose
      .model("User")
      .findById(this.receiver)
      .populate("role_code");
    if (!sender || !receiver || !sender.role_code || !receiver.role_code) {
      return next(
        new Error(
          "Nguời gửi hoặc người nhận không tồn tại hoặc không có quyền hạn."
        )
      );
    }

    // Chỉ cho phép:
    // User gửi đến Admin
    // Admin gửi cho User
    const senderRole = sender.role_code.code;
    const receiverRole = receiver.role_code.code;

    const isUserToAdmin = senderRole !== "R1" && receiverRole === "R1";
    const isAdminToUser = senderRole === "R1" && receiverRole !== "R1";

    if (!isUserToAdmin && !isAdminToUser) {
      return next(
        new Error(
          "Người gửi và người nhận không hợp lệ. Chỉ cho phép User gửi đến Admin hoặc Admin gửi cho User."
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Xuất model Message
module.exports = mongoose.model("Message", messageSchema);
