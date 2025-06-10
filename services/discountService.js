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
const applyDiscountForUser = async (discountId, userId) => {
  try {
    const discount = await Discount.findById(discountId);

    if (!discount) {
      return { success: false, message: "Mã giảm giá không tồn tại" };
    }

    // Thêm userId vào usedBy (nếu chưa có)
    if (!discount.usedBy.includes(userId)) {
      discount.usedBy.push(userId);
    }

    await discount.save();

    return {
      success: true,
      message: "Thêm người dùng vào mã giảm giá thành công",
      data: discount,
    };
  } catch (error) {
    console.error("Lỗi khi thêm người dùng vào mã giảm giá:", error);
    return { success: false, message: "Lỗi hệ thống khi xử lý mã giảm giá" };
  }
};

const getDiscountsByUserId = async (userId) => {
  try {
    if (!userId) {
      return { success: false, message: "Thiếu userId" };
    }

    const allDiscounts = await Discount.find();

    const usedDiscounts = [];
    const unusedDiscounts = [];

    allDiscounts.forEach((discount) => {
      if (discount.usedBy.includes(userId)) {
        usedDiscounts.push(discount);
      } else {
        unusedDiscounts.push(discount);
      }
    });

    return {
      success: true,
      used: usedDiscounts,
      unused: unusedDiscounts,
    };
  } catch (error) {
    console.error("Lỗi khi phân loại discount theo userId:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi phân loại mã giảm giá",
    };
  }
};

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  applyDiscountForUser,
  getDiscountsByUserId,
};
