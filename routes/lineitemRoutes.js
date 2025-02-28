const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();
const {
  createLineItemController,
  getLineItemController,
  deleteLineItemController,
  updateLineItemController,
} = require("../controllers/lineItemController");

// Router thêm lineItem
router.post("/add-lineitem", authenticateToken, createLineItemController);
// Router xem thông tin LineItem
router.get("/get-lineitem/:id", authenticateToken, getLineItemController);
// Router xóa LineItem
router.delete(
  "/delete-lineitem/:id",
  authenticateToken,
  deleteLineItemController
);
// Router chỉnh sửa LineItem
router.put("/update-lineitem/:id", authenticateToken, updateLineItemController);

module.exports = router;
