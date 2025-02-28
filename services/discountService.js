const Discount = require("../models/discountModel");

// 1️⃣ Tạo mã giảm giá
const createDiscount = async (discountData) => {
  try {
    // Kiểm tra nếu dữ liệu đầu vào hợp lệ
    if (
      !discountData ||
      !discountData.code ||
      (discountData.percent === undefined &&
        discountData.fixedAmount === undefined)
    ) {
      return { success: false, message: "Thiếu thông tin cần thiết" };
    }

    // Kiểm tra xem mã giảm giá đã tồn tại chưa
    const existingDiscount = await Discount.findOne({
      code: discountData.code,
    }).lean();
    if (existingDiscount) {
      return { success: false, message: "Mã giảm giá đã tồn tại." };
    }

    // Tạo mã giảm giá mới
    const newDiscount = await Discount.create(discountData);

    return {
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: newDiscount,
    };
  } catch (error) {
    console.error("Lỗi khi tạo Discount:", error);
    return { success: false, message: "Lỗi hệ thống khi tạo mã giảm giá" };
  }
};

// 2️⃣ Lấy danh sách tất cả mã giảm giá
const getAllDiscounts = async () => {
  try {
    const discounts = await Discount.find();
    return discounts;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Discount:", error);
    throw new Error("Lỗi hệ thống khi lấy danh sách mã giảm giá");
  }
};

// 3️⃣ Lấy mã giảm giá theo ID
const getDiscountById = async (id) => {
  try {
    const discount = await Discount.findById(id);
    return discount;
  } catch (error) {
    console.error("Lỗi khi lấy Discount theo ID:", error);
    throw new Error("Lỗi hệ thống khi lấy mã giảm giá");
  }
};

// 4️⃣ Cập nhật mã giảm giá
const updateDiscount = async (id, updateData) => {
  try {
    const updatedDiscount = await Discount.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return updatedDiscount;
  } catch (error) {
    console.error("Lỗi khi cập nhật Discount:", error);
    throw new Error("Lỗi hệ thống khi cập nhật mã giảm giá");
  }
};

// 5️⃣ Xóa mã giảm giá
const deleteDiscount = async (id) => {
  try {
    const deletedDiscount = await Discount.findByIdAndDelete(id);
    return deletedDiscount;
  } catch (error) {
    console.error("Lỗi khi xóa Discount:", error);
    throw new Error("Lỗi hệ thống khi xóa mã giảm giá");
  }
};

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
};
