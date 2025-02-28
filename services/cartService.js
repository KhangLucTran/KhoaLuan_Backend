const Cart = require("../models/cartModel");
const LineItem = require("../models/lineItemModel");
const mongoose = require("mongoose");

// Hàm tạo cart
const createCart = async (data) => {
  const cart = new Cart(data);
  return await cart.save();
};

// Hàm xóa card
const getCartById = async (id) => {
  return await Cart.findById(id).populate("items");
};

// Hàm thêm LineItem vô Card
const addLineItemToCart = async (cartId, lineItemId) => {
  const cart = await Cart.findById(cartId);
  if (!cart) throw new Error("Cart not found");

  cart.items.push(lineItemId);
  return await cart.save();
};
// Hàm lấy Cart theo userId
const getCartByUserId = async (userId) => {
  try {
    // Tìm Cart dựa trên userId và populate để lấy thông tin chi tiết items
    const objectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ user: objectId });
    return cart;
  } catch (error) {
    throw new Error(
      `Error fetching cart for userId ${userId}: ${error.message}`
    );
  }
};
// Hàm xóa LineItem theo id (chưa thanh toán)
const removeLineItemFromCart = async (cartId, lineItemId) => {
  try {
    // Tìm Cart theo cartId
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    // Xóa LineItem khỏi danh sách items trong Cart
    cart.items = cart.items.filter((item) => item.toString() !== lineItemId);
    await cart.save();

    // Xóa LineItem khỏi cơ sở dữ liệu
    const deletedLineItem = await LineItem.findByIdAndDelete(lineItemId);
    if (!deletedLineItem) {
      throw new Error("LineItem not found");
    }

    return {
      message: "LineItem removed from cart and deleted successfully",
      deletedLineItem,
    };
  } catch (error) {
    console.error(`Error removing LineItem from Cart: ${error.message}`);
    throw new Error(`Failed to remove LineItem: ${error.message}`);
  }
};
// Hàm xóa LineItem theo id (đã thanh toán)
const removeLineItemFromCartPayment = async (cartId, lineItemId) => {
  try {
    // Tìm Cart theo cartId
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    // Xóa LineItem khỏi danh sách items trong Cart
    cart.items = cart.items.filter((item) => item.toString() !== lineItemId);
    await cart.save();

    return {
      message: "LineItem removed from cart and deleted successfully",
    };
  } catch (error) {
    console.error(`Error removing LineItem from Cart: ${error.message}`);
    throw new Error(`Failed to remove LineItem: ${error.message}`);
  }
};

// Hàm xóa nhiều LineItem theo danh sách ID
const removeLineItemsFromCart = async (cartId, lineItemIds) => {
  try {
    // Tìm Cart theo cartId
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    // Xóa LineItems khỏi danh sách items trong Cart
    cart.items = cart.items.filter(
      (item) => !lineItemIds.includes(item.toString())
    );
    await cart.save();

    // Xóa từng LineItem khỏi cơ sở dữ liệu
    const deletedLineItems = [];
    for (const lineItemId of lineItemIds) {
      const deletedItem = await LineItem.findByIdAndDelete(lineItemId);
      if (deletedItem) {
        deletedLineItems.push(deletedItem);
      } else {
        console.warn(`LineItem with ID ${lineItemId} not found`);
      }
    }

    return {
      message: "LineItems removed from cart and deleted successfully",
      deletedCount: deletedLineItems.length,
      deletedLineItems,
    };
  } catch (error) {
    console.error(`Error removing LineItems from Cart: ${error.message}`);
    throw new Error(`Failed to remove LineItems: ${error.message}`);
  }
};

// Hàm lấy tổng số lượng sản phẩm trong cart
const getTotalQuantity = async (userId) => {
  try {
    // Tìm giỏ hàng theo userId và populate để lấy thông tin đầy đủ của LineItem
    const cart = await Cart.findOne({ user: userId }).populate("items");
    if (!cart) throw new Error("Không tìm thấy Giò hàng");

    // Tính tổng số lượng của tất cả LineItem trong giỏ hàng
    const totalQuantity = cart.items.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );

    console.log("Tổng số lượng sản phẩm trong giỏ hàng:", totalQuantity);

    return totalQuantity;
  } catch (error) {
    console.error(`Error getting total quantity: ${error.message}`);
    throw new Error(`Failed to get total quantity: ${error.message}`);
  }
};

module.exports = {
  createCart,
  getCartById,
  addLineItemToCart,
  removeLineItemFromCart,
  getCartByUserId,
  removeLineItemsFromCart,
  removeLineItemFromCartPayment,
  getTotalQuantity,
};
