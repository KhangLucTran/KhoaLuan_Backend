const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { uploadCloud } = require("../middleware/cloudinary");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");

// Route thêm sản phẩm với nhiều ảnh (chỉ có admin)
router.post(
  "/add-product",
  authenticateToken,
  uploadCloud.array("images", 10),
  productController.addProductController
);

// Route xóa sản phẩm theo id (chỉ có admin)
router.delete(
  "/delete-product/:id",
  authenticateToken,
  productController.deleteProductByIdController
);
// Route xóa sản phẩm theo title
router.delete(
  "/delete-product-title/:title",
  productController.deleteProductByTitleController
);
// Route lấy sản phẩm theo  (PULIC)
router.get("/get-product/:id", productController.getProductByIdController);
// Route lấy tất cả sản phẩm (PULIC)
router.get("/getall-product", productController.getAllProducts);
router.get("/get-product/:id", productController.getProductByIdController);
// Route lấy tất cả sản phẩm (PULIC)
router.get(
  "/getall-product-category",
  productController.getProductByCategoryController
);

// Route chỉnh sửa sản phẩm theo id
router.put(
  "/update-product/:id",
  authenticateToken,
  authorizeAdmin,
  productController.updateProductById
);
7;

module.exports = router;
