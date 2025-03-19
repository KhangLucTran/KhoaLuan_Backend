const User = require("../models/userModel");
const Product = require("../models/productModel");
const searchHistoryService = require("./searchHistoryService");

// Hàm ánh xạ trending keywords thành các loại sản phẩm của cửa hàng
const mapTrendingToCategory = (keywords) => {
  const mappedCategories = new Set();

  keywords.forEach((keyword) => {
    const normalized = keyword.trim().toLowerCase();
    // Nếu chứa từ "áo", "áo thun", "áo sơ mi", v.v.
    if (normalized.includes("áo")) {
      mappedCategories.add("Shirt");
    }
    // Nếu chứa từ "quần"
    if (normalized.includes("quần")) {
      mappedCategories.add("Pants");
    }
    // Nếu chứa từ "nón"
    if (normalized.includes("nón")) {
      mappedCategories.add("Hat");
    }
  });

  return Array.from(mappedCategories);
};

// Lấy danh sách tìm kiếm gần đây của user
const getRecentSearches = async (userId) => {
  return await searchHistoryService.getRecentSearches(userId);
};

// 🔹 Collaborative Filtering: Dựa trên người dùng có hành vi tương tự
const getCollaborativeRecommendations = async (userId) => {
  // Lấy danh sách tìm kiếm theo userId
  const userSearches = await getRecentSearches(userId);
  if (!userSearches.length) return [];
  console.log("User Searchers:", userSearches);
  //Lấy danh sách các từ khóa cụ thể từ userSearches (nếu có dữ liệu)
  const searchKeyWords = userSearches.map((s) => s.keyword);

  // Tìm kiếm user có lịch sử tìm kiếm tương tự
  const similarUsers = await searchHistoryService.findSimilarUsers(
    userId,
    searchKeyWords
  );
  console.log("similarUsers:", similarUsers);
  if (!similarUsers.length) return [];

  // Tổng hợp từ khóa phổ biến từ những user tương tự
  const recommendedKeywords = new Set();
  for (let user of similarUsers) {
    const searches = await getRecentSearches(user._id);
    console.log("searches:", searches);
    searches.forEach((s) => recommendedKeywords.add(s.keyword));
  }
  console.log("recommendKkeywords:", recommendedKeywords);

  // Ánh xạ trending keywords thành các category
  const mappedCategories = mapTrendingToCategory(recommendedKeywords);
  console.log("Mapped categories:", mappedCategories);

  // Tìm sản phẩm liên quan đến các từ khóa này
  return await Product.find({
    category: { $in: Array.from(mappedCategories) },
  }).limit(10);
};

//🔹 Content-based Filtering: Gợi ý dựa trên nội dung sản phẩm đã tìm kiếm
const getContentBaseRecommendations = async (userId) => {
  // Lấy lịch sử tìm kiếm
  const userSearches = await getRecentSearches(userId);
  console.log("userSearches in serivce:", userSearches);
  if (!userSearches.length) return [];

  // Lấy danh sách từ khóa tìm kiếm
  const searchKeywords = userSearches.map((s) => s.keyword);
  console.log("searchKeyword in service:", searchKeywords);

  // Tạo điều kiện tìm kiếm: title chứa một trong các từ khóa (không phân biệt chữ hoa thường)
  const queryConditions = searchKeywords.map((keyword) => ({
    title: { $regex: keyword, $options: "i" },
  }));

  // Truy vấn các sản phẩm có title chứa ít nhất một trong các từ khóa
  return await Product.find({ $or: queryConditions }).limit(10);
};

// 🔹 Personalized Recommendations: Gợi ý cho user mới chưa có lịch sử tìm kiếm
const getPersonalizedRecommnedations = async () => {
  // Lấy từ khóa trending từ searchHistory
  const trendingProducts = await searchHistoryService.getTrendingKeywords();
  console.log("Trending Product in service:", trendingProducts);

  // Ánh xạ trending keywords thành các category
  const mappedCategories = mapTrendingToCategory(trendingProducts);
  console.log("Mapped categories:", mappedCategories);

  // Nếu không có category nào được ánh xạ, có thể dùng fallback (ví dụ: lấy sản phẩm mới nhất)
  if (!mappedCategories.length) {
    return await Product.find().limit(10);
  }

  // Truy vấn sản phẩm dựa trên category
  return await Product.find({ category: { $in: mappedCategories } }).limit(10);
};

// 🔹 Kết hợp cả 3 phương pháp để tạo danh sách gợi ý tốt nhất
const getHybridRecommendations = async (userId) => {
  const [collaborative, contentBased, personalized] = await Promise.all([
    getCollaborativeRecommendations(userId),
    getContentBaseRecommendations(userId),
    getPersonalizedRecommnedations(),
  ]);

  // Kết hợp danh sách đề xuất từ cả ba phương pháp
  const mergedRecommendations = new Map();

  const addToRecommendations = (products, type) => {
    products.forEach((product) => {
      if (!mergedRecommendations.has(product._id)) {
        mergedRecommendations.set(product._id, { ...product._doc, score: 0 });
      }
      mergedRecommendations.get(product._id).score +=
        type === "collaborative" ? 3 : type === "content" ? 2 : 1;
    });
  };

  addToRecommendations(collaborative, "collaborative");
  addToRecommendations(contentBased, "content");
  addToRecommendations(personalized, "personal");

  // Sắp xếp danh sách theo điểm số cao nhất
  return Array.from(mergedRecommendations.values()).sort(
    (a, b) => b.score - a.score
  );
};
// API chính để lấy danh sách gợi ý sản phẩm
const getRecommendations = async (userId) => {
  return await getHybridRecommendations(userId);
};

module.exports = {
  getRecommendations,
  getContentBaseRecommendations,
  getPersonalizedRecommnedations,
  getCollaborativeRecommendations,
};
