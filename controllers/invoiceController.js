const moment = require("moment");
const InvoiceService = require("../services/invoiceService");
const CartService = require("../services/cartService");
const mongoose = require("mongoose");
const LineItem = require("../models/lineItemModel");
const socketHandler = require("../config/socketHandler");
const { createNotification } = require("../services/notificationService");

// Change Status -> Text
const getStatus = (status) => {
  switch (status) {
    case "Pending":
      return "Đơn Hàng Đã Đặt";
    case "Paid":
      return "Đã Xác Nhận Thông Tin Thanh Toán";
    case "Shipped":
      return "Đã Giao Cho ĐVVC";
    case "Completed":
      return "Đơn Hàng Đã Hoàn Thành";
    default:
      return "Đã hủy";
  }
};

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
  // API lấy Invoice theo userID từ Admin
  static async getInvoiceByUserIdByAdmin(req, res) {
    try {
      const userId = req.params.userId; // Lấy userId từ params
      if (!userId)
        return res.status(400).json({ message: "UserID là bắt buộc" });
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
  // API lấy update invoice
  static async updateHasRatedInvoices(req, res) {
    try {
      const { id } = req.params; // Lấy invoiceId từ params
      const { productId } = req.body; // Lấy productId từ body
      const invoices = await InvoiceService.updateHasRated(id, productId);
      res.status(200).json({ invoices });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // API cập nhật trạng thái của Invoice
  static async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params; // Invoice ID
      const { status } = req.body; // Trạng thái mới
      console.log(id);
      // Kiểm tra trạng thái mới
      if (!status) {
        return res.status(400).json({ message: "Trạng thái mới là bắt buộc" });
      }
      const updatedInvoice = await InvoiceService.updateInvoiceStatus(
        id,
        status
      );
      // Emit notification tới người dùng
      if (updatedInvoice?.user) {
        createNotification({
          user: updatedInvoice.user._id,
          title: "Cập nhật trạng thái đơn hàng",
          isGlobal: false,
          message: `Đơn hàng #${
            updatedInvoice._id
          } đã được cập nhật sang trạng thái: ${getStatus(status)}`,
          invoiceId: updatedInvoice._id,
          type: "order",
        });

        // Gửi socket đến user
        socketHandler.emitInvoiceStatus(
          updatedInvoice.user._id,
          updatedInvoice
        );
      }
      res.status(200).json({
        message: "Cập nhật trạng thái hóa đơn thành công",
        invoice: updatedInvoice,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = InvoiceController;
