const searchHistoryService = require("../services/searchHistoryService");

// Thêm keyword tìm kiếm
const addKeywordsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { keyword } = req.body;
    if (!userId || !keyword) {
      return res
        .status(400)
        .json({ message: "UserId và keyword là bắt buộc." });
    }

    // Gọi hàm thêm từ khóa vào lịch sử tìm kiếm
    await searchHistoryService.addSearchHistory(userId, keyword);

    return res.status(200).json({ message: "Keyword added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addKeywordsController };
