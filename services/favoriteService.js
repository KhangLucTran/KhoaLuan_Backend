const FavoriteProduct = require("../models/favoriteProduct");

const addFavorite = async (userId, productId) => {
  try {
    const favorite = await FavoriteProduct.create({ userId, productId });
    return favorite;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Sản phẩm này đã nằm trong danh sách yêu thích của bạn.");
    }
    throw new Error("Lỗi khi thêm sản phẩm vào danh sách yêu thích.");
  }
};

const removeFavoriteById = async (favoriteId) => {
  try {
    // Tìm và xóa Favorite bằng ID
    const favorite = await FavoriteProduct.findByIdAndDelete(favoriteId);
    return favorite;
  } catch (error) {
    throw new Error("Lỗi khi xóa mục yêu thích.");
  }
};

const removeFavoriteByUserAndProduct = async (userId, productId) => {
  try {
    // Tìm và xóa mục yêu thích dựa trên userId và productId
    console.log(userId);
    console.log(productId);
    const favorite = await FavoriteProduct.findOneAndDelete({
      userId,
      productId,
    });
    console.log(favorite);
    // Trả về kết quả, null nếu không tìm thấy
    return favorite;
  } catch (error) {
    throw new Error("Lỗi khi xóa mục yêu thích.");
  }
};
const getAllFavorites = async (userId) => {
  return await FavoriteProduct.find({ userId }).populate("productId");
};

const checkFavoriteStatus = async (userId, productId) => {
  const favorite = await FavoriteProduct.findOne({ userId, productId });
  return !!favorite; // Trả về true nếu tìm thấy
};

module.exports = {
  addFavorite,
  removeFavoriteById,
  getAllFavorites,
  checkFavoriteStatus,
  removeFavoriteByUserAndProduct,
};
