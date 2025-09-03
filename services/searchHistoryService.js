const SearchHistory = require("../models/searchHistory");

// Lấy danh sách tìm kiếm
const getRecentSearches = async (userId, limit = 10) => {
  const searches = await SearchHistory.find({ userId })
    .sort({ date: -1 }) // Lấy dữ liệu gần nhất
    .limit(14); // Lấy lịch sử của 5 ngày gần nhất

  return searches
    .flatMap((item) => item.keywords)
    .sort((a, b) => b.timestamp - a.timestamp) // Sắp xếp theo thời gian giảm dần
    .slice(0, limit); // Giới hạn số lượng
};

// Hàm thêm từ khóa tìm kiếm vào lịch sử
const addSearchHistory = async (userId, keyword) => {
  const today = new Date().setHours(0, 0, 0, 0); // Định dạng ngày
  await SearchHistory.findOneAndUpdate(
    { userId, date: today },
    { $push: { keywords: { keyword, timestamp: new Date() } } },
    { upsert: true, new: true }
  );
};

// Hàm xóa từ khóa dữ liệu nếu không muốn TTL xóa sau 14 ngày
const deleteOldSearchHistory = async () => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  await SearchHistory.deleteMany({ date: { $lt: fourteenDaysAgo } });
};

// 🔹 Tìm người dùng có lịch sử tìm kiếm tương tự
const findSimilarUsers = async (userId, keywords) => {
  return await SearchHistory.aggregate([
    {
      $match: {
        userId: { $ne: userId },
        keywords: { $elemMatch: { keyword: { $in: keywords } } },
      },
    },
    {
      $group: {
        _id: "$userId",
        keywordMatches: { $sum: 1 },
      },
    },
    { $sort: { keywordMatches: -1 } },
    { $limit: 5 },
  ]);
};

// 🔹 Lấy từ khóa phổ biến nhất trong 14 ngày gần nhất
const getTrendingKeywords = async (limit = 10) => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const trending = await SearchHistory.aggregate([
    { $match: { date: { $gte: fourteenDaysAgo } } },
    { $unwind: "$keywords" },
    { $group: { _id: "$keywords.keyword", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return trending.map((t) => t._id);
};

module.exports = {
  getRecentSearches,
  addSearchHistory,
  deleteOldSearchHistory,
  findSimilarUsers,
  getTrendingKeywords,
};
