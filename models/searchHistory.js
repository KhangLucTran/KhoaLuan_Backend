const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    index: true,
  }, // Lưu theo ngày
  keywords: [
    {
      keyword: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// Xóa document sau 14 ngày để tránh dữ liệu phình to
searchHistorySchema.index({ date: 1 }, { expireAfterSeconds: 1209600 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
