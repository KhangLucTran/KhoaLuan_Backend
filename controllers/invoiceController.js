const moment = require("moment");
const InvoiceService = require("../services/invoiceService");
const CartService = require("../services/cartService");
const mongoose = require("mongoose");
const LineItem = require("../models/lineItemModel");

class InvoiceController {
  // API tạo Invoice (không có VNPAY)
  static async createInvoice(req, res) {
    try {
      const { cartId, userId, lineItemIds, totalAmount } = req.body;
      console.log(totalAmount);

      // Kiểm tra các tham số đầu vào
      if (
        !cartId ||
        !userId ||
        !Array.isArray(lineItemIds) ||
        lineItemIds.length === 0
      ) {
        return res.status(400).json({
          message: "Cart ID, User ID, and Line Item IDs are required",
        });
      }

      // Tạo mảng productIds từ các lineItemIds
      const productIds = await Promise.all(
        lineItemIds.map(async (lineItemId) => {
          const lineItem = await LineItem.findById(lineItemId).populate(
            "product"
          ); // populate "product" để lấy thông tin của Product
          if (!lineItem) {
            throw new Error(`Line item with ID ${lineItemId} not found`);
          }
          return lineItem.product._id; // Trả về productId của mỗi lineItem (thông qua populate)
        })
      );

      // Tạo hóa đơn qua InvoiceService
      const invoice = await InvoiceService.createInvoice({
        cart: cartId,
        user: userId,
        productIds: productIds, // Gán mảng productIds vào invoice
        totalAmount: totalAmount,
      });

      // Xóa các lineItem trong cart
      // Sau khi tạo hóa đơn thành công, xóa các LineItem khỏi Cart
      for (let lineItemId of lineItemIds) {
        // Gọi hàm xóa LineItem khỏi Cart
        await CartService.removeLineItemFromCart(cartId, lineItemId);
      }

      res.status(201).json({
        message: "Invoice created successfully",
        invoice,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // API xác nhận hóa đơn (admin xác nhận)
  static async confirmInvoice(req, res) {
    try {
      const invoiceId = req.params.id;
      const objectId = new mongoose.Types.ObjectId(invoiceId);
      console.log(invoiceId);
      if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID is required" });
      }

      const updatedInvoice = await InvoiceService.confirmInvoice(objectId);

      res.status(200).json({
        message: "Invoice confirmed successfully",
        invoice: updatedInvoice,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // API lấy Invoice theo userID
  static async getInvoiceByUserId(req, res) {
    try {
      const userId = req.user._id;
      console.log("userId trong controller:", userId);
      const invoice = await InvoiceService.getInvoiceByUserId(userId);

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.status(200).json({ invoice });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // API lấy Invoice theo InvoiceId
  static async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoiceById(id);

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.status(200).json({ invoice });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // API lấy tất cả invoices
  static async getAllInvoices(req, res) {
    try {
      const invoices = await InvoiceService.getAllInvoices();
      res.status(200).json({ invoices });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = InvoiceController;
