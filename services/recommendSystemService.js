const User = require("../models/userModel");
const Product = require("../models/productModel");
const searchHistoryService = require("./searchHistoryService");

// Keywords
const keywordsToCategory = {
  "T-Shirt": ["áo", "áo thun"],
  Shirt: ["áo", "áo sơ mi"],
  Pants: ["quần", "quần dài"],
  Hat: ["nón", "mũ"],
  Short: ["'quần", "quần ngắn", "quần short", "quần jean ngắn"],
  Accessories: ["phụ kiện", "vòng tay", "vòng cổ"],
  Jacket: ["áo khoác", "áo khoác da"],
};

// Mapping từ khóa trending thành các category
// Chuyển đổi từ khóa thành các category tương ứng
const mapTrendingToCategory = (keywords) => {
  const mappedCategories = new Set();

  keywords.forEach((keyword) => {
    const normalized = keyword.trim().toLowerCase();
    for (const [category, relatedKeywords] of Object.entries(
      keywordsToCategory
    )) {
      if (relatedKeywords.some((word) => normalized.includes(word))) {
        mappedCategories.add(category);
      }
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
  });
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
  return await Product.find({ $or: queryConditions });
};

// 🔹 Personalized Recommendations: Gợi ý cho user mới chưa có lịch sử tìm kiếm
const getPersonalizedRecommendations = async () => {
  // Lấy từ khóa trending từ searchHistory
  const trendingProducts = await searchHistoryService.getTrendingKeywords();
  console.log("Trending Product in service:", trendingProducts);

  // Ánh xạ trending keywords thành các category
  const mappedCategories = mapTrendingToCategory(trendingProducts);
  console.log("Mapped categories:", mappedCategories);

  // Nếu không có category nào được ánh xạ, có thể dùng fallback (ví dụ: lấy sản phẩm mới nhất)
  if (!mappedCategories.length) {
    return await Product.find();
  }

  // Truy vấn sản phẩm dựa trên category
  return await Product.find({ category: { $in: mappedCategories } });
};

// 🔹 Kết hợp cả 3 phương pháp để tạo danh sách gợi ý tốt nhất
const getHybridRecommendations = async (userId) => {
  const [collaborative, contentBased, personalized, allProducts] =
    await Promise.all([
      getCollaborativeRecommendations(userId),
      getContentBaseRecommendations(userId),
      getPersonalizedRecommendations(),
      Product.find(), // ✅ lấy toàn bộ sản phẩm trong DB
    ]);

  const uniqueRecommendations = new Map();

  const addToRecommendations = (products, priority) => {
    products.forEach((product) => {
      const productId = product._id.toString();
      if (!uniqueRecommendations.has(productId)) {
        uniqueRecommendations.set(productId, {
          ...product.toObject(),
          priority,
        });
      } else {
        uniqueRecommendations.get(productId).priority = Math.max(
          uniqueRecommendations.get(productId).priority,
          priority
        );
      }
    });
  };

  addToRecommendations(contentBased.slice(0, 5), 3); // Ưu tiên cao nhất
  addToRecommendations(collaborative.slice(0, 5), 2);
  addToRecommendations(personalized, 1);

  // ✅ Gộp thêm các sản phẩm chưa có trong gợi ý, set priority = 0
  allProducts.forEach((product) => {
    const productId = product._id.toString();
    if (!uniqueRecommendations.has(productId)) {
      uniqueRecommendations.set(productId, {
        ...product.toObject(),
        priority: 0, // priority thấp nhất (sản phẩm không nằm trong gợi ý)
      });
    }
  });

  return Array.from(uniqueRecommendations.values()).sort(
    (a, b) => b.priority - a.priority
  );
};

// API chính để lấy danh sách gợi ý sản phẩm
const getRecommendations = async (userId) => {
  return await getHybridRecommendations(userId);
};

module.exports = {
  getRecommendations,
  getContentBaseRecommendations,
  getPersonalizedRecommendations,
  getCollaborativeRecommendations,
};
