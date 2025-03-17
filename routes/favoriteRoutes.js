const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const authenticateToken = require("../middleware/authMiddleware");

// Route thêm sản phẩm yêu thích
router.post("/", authenticateToken, favoriteController.addFavoriteController);
// Route lấy tất cả sản phẩm yêu thích
router.get(
  "/",
  authenticateToken,
  favoriteController.getAllFavoritesController
);

// Route Xóa sản phẩm yêu thích
router.delete(
  "/delete/:favoriteId",
  authenticateToken,
  favoriteController.removeFavoriteController
);

// Route kiểm tra trạng thái yêu thích
router.get(
  "/:productId",
  authenticateToken,
  favoriteController.getFavoriteStatusController
);

// Route xóa theo userId và productID
router.delete(
  "/delete-by-prouse",
  authenticateToken,
  favoriteController.removeFavoriteByProUserController
);

module.exports = router;
