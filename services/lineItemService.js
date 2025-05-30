const LineItem = require("../models/lineItemModel");
const { getCartByUserId, addLineItemToCart } = require("./cartService");
const mongoose = require("mongoose");

// Hàm tạo LineItem
const createLineItem = async (req, res) => {
  try {
    const { product, quantity, price, size, color, gender } = req.body;
    const productId = new mongoose.Types.ObjectId(product);

    // Tạo một instance mới của LineItem
    const newLineItem = new LineItem({
      product: productId,
      quantity,
      price,
      size,
      color,
      gender,
    });

    // Lưu LineItem vào cơ sở dữ liệu
    await newLineItem.save();

    // Lấy cart của người dùng từ userId (req.user.id)
    const userId = req.user._id; // Giả sử `req.user` chứa thông tin người dùng
    const userCart = await getCartByUserId(userId);

    // Thêm LineItem vào giỏ hàng
    await addLineItemToCart(userCart._id, newLineItem._id);

    // Trả về LineItem mới tạo
    if (!res.headersSent) {
      return res.status(201).json({
        message: "LineItem created successfully",
        lineItem: newLineItem,
      });
    }
  } catch (error) {
    console.error(error);
    // Đảm bảo không gửi response nhiều lần
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: "Failed to create LineItem", error: error.message });
    }
  }
};

// Hàm lấy Lineitem theo Id
const getLineItemById = async (id) => {
  return await LineItem.findById(id).populate("product");
};

// Hàm Update LineItem
const updateLineItem = async (id, updates) => {
  return await LineItem.findByIdAndUpdate(id, updates, { new: true });
};

// Hàm xóa LineItem theo id
const deleteLineItem = async (id) => {
  const lineItem = await LineItem.findByIdAndDelete(id);
  if (!lineItem) {
    throw new Error("LineItem not found");
  }
  return lineItem;
};

module.exports = {
  createLineItem,
  getLineItemById,
  updateLineItem,
  deleteLineItem,
};
