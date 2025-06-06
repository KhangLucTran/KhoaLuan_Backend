const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authenticateToken = require("../middleware/authMiddleware");
const Invoice = require("../models/invoiceModel");
const CartService = require("../services/cartService");

// Tạo hóa đơn mới
router.post("/", authenticateToken, invoiceController.createInvoice);

// Xác nhận hóa đơn (admin xác nhận)
router.post(
  "/confirm/:id",
  authenticateToken,
  invoiceController.confirmInvoice
);

// Update invoice
router.put(
  "/update/:id",
  authenticateToken,
  invoiceController.updateHasRatedInvoices
);

// Lấy tất cả invoices theo userId
router.get(
  "/get-invoice-user",
  authenticateToken,
  invoiceController.getInvoiceByUserId
);
// Lấy tất cả invoices theo userId từ Admin
router.get(
  "/get-invoice-user-admin/:userId",
  authenticateToken,
  invoiceController.getInvoiceByUserIdByAdmin
);

router.get(
  "/get-invoice/:id",
  authenticateToken,
  invoiceController.getInvoiceById
);

// Update trạng thái của invoice
router.put(
  "/update-invoice-status/:id",
  authenticateToken,
  invoiceController.updateInvoiceStatus
);

// Lấy tất cả invoices
router.get("/", authenticateToken, invoiceController.getAllInvoices);

// Tọa Invoice không cần VNPAY
router.post("/create-invoice", async (req, res) => {
  try {
    const { userId, amount, selectedCartItems, cartId, orderId, bankCode } =
      req.body;
    console.log("userId", userId);
    console.log("cartId", cartId);
    console.log("selectedCartItems", selectedCartItems);
    // Kiểm tra các tham số đầu vào
    if (
      !userId ||
      !amount ||
      !Array.isArray(selectedCartItems) ||
      selectedCartItems.length === 0 ||
      !cartId
    ) {
      return res.status(400).json({
        message: "userId, amount, selectedCartItems, and cartId are required",
      });
    }

    // Tạo một hóa đơn mới từ dữ liệu nhận được
    const newInvoice = new Invoice({
      user: userId,
      totalAmount: amount,
      lineItems: selectedCartItems.map((item) => ({
        productId: item.productId,
        productName: item.title,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        size: item.size,
        color: item.color,
        gender: item.gender,
      })),
      vnp_TxnRef: orderId, // Lưu mã đơn hàng để đối chiếu sau này
      paymentMethod: bankCode || "VNPAY", // Nếu không có bankCode thì mặc định là "VNPAY"
    });

    // Lưu hóa đơn vào MongoDB
    await newInvoice.save();

    // Xóa các LineItems khỏi giỏ hàng (chỉ cần cập nhật mảng items trong giỏ hàng, không cần xóa document)
    const lineItemIds = selectedCartItems.map((item) => item.id);
    console.log("lineItemIds", lineItemIds);
    await CartService.removeLineItemsFromCart(cartId, lineItemIds);

    // Trả về phản hồi thành công
    res.status(201).json({
      message: "Invoice created successfully",
      invoice: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({
      message: "An error occurred while creating the invoice",
      error: error.message,
    });
  }
});

module.exports = router;
