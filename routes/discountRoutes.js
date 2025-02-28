const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/authorizeAdmin");
// 1. API: thêm Discount, cần token (chỉ có Admin)
router.post(
  "/add-discount",
  authenticateToken,
  authorizeAdmin,
  discountController.createDiscount
);

// 2. API: lấy tất cả Discount, cần token (PUBLIC)
router.get("/getall-discount", discountController.getAllDiscounts);

// 3. API: lấy Discount theo id, cần token
router.get(
  "/get-discount/:id",
  authenticateToken,
  discountController.getDiscountById
);

// 4. API: chỉnh sửa Discount theo id
router.put(
  "/update-discount/:id",
  authenticateToken,
  discountController.updateDiscount
);

// 5. API: xóa Discount theo id
router.delete(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  discountController.deleteDiscount
);

module.exports = router;
