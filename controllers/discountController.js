const DiscountService = require("../services/discountService");

// 1. Tạo mã giảm giá mới
const createDiscount = async (req, res) => {
  try {
    const discountData = req.body;
    const result = await DiscountService.createDiscount(discountData);

    if (!result.success) {
      return res.status(400).json(result); // Trả về lỗi 400 nếu có lỗi
    }

    return res.status(201).json(result); // Trả về 201 nếu tạo thành công
  } catch (error) {
    console.error("Lỗi trong createDiscount:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 2. Lấy danh sách tất cả mã giảm giá
const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await DiscountService.getAllDiscounts();
    return res.status(200).json({ success: true, data: discounts });
  } catch (error) {
    console.error("Lỗi trong getAllDiscounts:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 3.  Lấy mã giảm giá theo ID
const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await DiscountService.getDiscountById(id);

    if (!discount) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy mã giảm giá" });
    }

    return res.status(200).json({ success: true, data: discount });
  } catch (error) {
    console.error("Lỗi trong getDiscountById:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 4. Cập nhật mã giảm giá
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedDiscount = await DiscountService.updateDiscount(
      id,
      updateData
    );

    if (!updatedDiscount) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá để cập nhật",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: updatedDiscount,
    });
  } catch (error) {
    console.error("Lỗi trong updateDiscount:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 5. Xóa mã giảm giá
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DiscountService.deleteDiscount(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy mã giảm giá để xóa" });
    }

    return res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    console.error("Lỗi trong deleteDiscount:", error);
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

// 6. Hàm áp dụng Discount của user
const applyDiscount = async (req, res) => {
  const discountId = req.body;
  const userId = req.user._id; // Lấy userId từ token đã xác thực
  const result = await DiscountService.applyDiscountForUser(discountId, userId);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.status(200).json(result);
};

const getDiscountsByUser = async (req, res) => {
  const userId = req.user._id;

  const result = await DiscountService.getDiscountsByUserId(userId);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};
module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
  getDiscountsByUser,
};
