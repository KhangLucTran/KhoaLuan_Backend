const cartService = require("../services/cartService");
const mongoose = require("mongoose");

const createCartController = async (req, res) => {
  try {
    const cart = await cartService.createCart(req.body);
    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCartController = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getCartByIdUserController = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await cartService.getCartByUserId(userId);
    res.status(200).json(cart);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const removeLineItemFromCartController = async (req, res) => {
  try {
    const { cartId, lineItemId } = req.params;

    // Gọi service để xóa LineItem
    const result = await cartService.removeLineItemFromCart(cartId, lineItemId);

    res.status(200).json({
      message: result.message,
      deletedLineItem: result.deletedLineItem,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

const getTotalQuantityCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    // Gpị service để lấy tổng số lượng sản phẩm trong cart
    const result = await cartService.getTotalQuantity(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createCartController,
  getCartController,
  getCartByIdUserController,
  getTotalQuantityCart,
  removeLineItemFromCartController,
};
