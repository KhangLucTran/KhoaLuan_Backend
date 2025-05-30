const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const authenticateToken = require("../middleware/authMiddleware");

// Tạo hóa đơn mới
router.post("/", authenticateToken, invoiceController.createInvoice);

// Xác nhận hóa đơn (admin xác nhận)
router.post(
  "/confirm/:id",
  authenticateToken,
  invoiceController.confirmInvoice
);

// Lấy tất cả invoices theo userId
router.get(
  "/get-invoice-user",
  authenticateToken,
  invoiceController.getInvoiceByUserId
);

// Lấy tất cả invoices theo userId
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

module.exports = router;
