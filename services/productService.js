// services/productService.js
const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const NotificationService = require("../services/notificationService");

// Hàm upload ảnh lên Cloudinary
const uploadImageToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products", // Lưu ảnh trong thư mục 'produucts'
      use_filename: true, // Sử dụng tên file gốc
      unique_filename: false, // Không thêm chuỗi ngẫu nhiên vào tên file
    });
    return result.secure_url; // Trả về URL của ảnh
  } catch (error) {
    throw new Error("Lỗi khi upload ảnh lên Cloudinary: " + error.message);
  }
};

// Thêm sản phẩm mới với nhiều ảnh
const addProduct = async (productData, files) => {
  try {
    if (files && files.length > 0) {
      // Lấy danh sách URL ảnh từ Cloudinary
      const imageUrls = [];
      for (const file of files) {
        const imageUrl = await uploadImageToCloudinary(file); // Upload ảnh lên Cloudinary
        imageUrls.push(imageUrl); // Thêm URL ảnh vào mảng
      }
      productData.images = imageUrls; // Gán mảng ảnh cho sản phẩm
    }

    const newProduct = new Product(productData); // Tạo mới sản phẩm
    await newProduct.save(); // Lưu vào DB

    // ✅ Gửi thông báo sau khi thêm sản phẩm thành công
    await NotificationService.sendGenericNotification(
      null, // Không chỉ định user cụ thể
      `🆕 Levents đã thêm một sản phẩm mới: ${newProduct.title}!`, // Nội dung thông báo
      "product", // Loại thông báo
      { productId: newProduct._id } // Dữ liệu bổ sung
    );

    return newProduct; // Trả về sản phẩm vừa thêm
  } catch (error) {
    throw new Error("Error adding product: " + error.message);
  }
};

// Lấy tất cả sản phẩm
const getAllProducts = async () => {
  try {
    return await Product.find();
  } catch (error) {
    throw new Error("Error fetching products: " + error.message);
  }
};

// Hàm xóa sản phẩm theo title
const deleteProductByTitle = async (title) => {
  try {
    // Tìm và xóa sản phẩm theo title
    const result = await Product.findOneAndDelete({ title });

    if (!result) {
      throw new Error("Sản phẩm không tồn tại.");
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error fetching product by ID: " + error.message);
  }
};

// Chỉnh sửa sản phẩm theo ID
const updateProductById = async (id, productData, file) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (file) {
      const imageUrl = await uploadImageToCloudinary(file);
      productData.images = [imageUrl]; // Cập nhật ảnh sản phẩm
    }

    Object.assign(product, productData); // Cập nhật thông tin sản phẩm
    await product.save();
    return product;
  } catch (error) {
    throw new Error("Error updating product: " + error.message);
  }
};

// Update số lượng sản phẩm khi đã bán được
const updateStockProduct = async (lineItems) => {
  try {
    for (const item of lineItems) {
      const { productId, quantity } = item;

      // Tìm sản phẩm theo ID
      const product = await Product.findById(productId);
      if (!product) {
        console.log(`Sản phẩm với ID ${productId} không tồn tại.`);
        continue;
      }

      // Kiểm tra xem còn đủ hàng không
      if (product.stock < quantity) {
        console.log(`Sản phẩm ${product.title} không đủ hàng trong kho.`);
        continue;
      }

      // Cập nhật số lượng tồn kho và số lượng đã bán
      product.stock -= quantity;
      product.sold += quantity;
      await product.save();
      console.log(
        `Đã cập nhật tồn kho cho sản phẩm: ${product.title}. Số lượng còn lại: ${product.stock}, Đã bán: ${product.sold}`
      );
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm tồn kho", error);
  }
};

// Xóa sản phẩm theo ID
const deleteProductById = async (id) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};

// Lấy sản phẩm theo danh mục
const getProductByCategory = async (category) => {
  try {
    const products = await Product.find({ category: category });
    if (!products) {
      throw new Error("Product not found");
    }
    return products;
  } catch (error) {
    throw new Error("Error geting product: " + error.message);
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  deleteProductByTitle,
  updateStockProduct,
  getProductByCategory,
};
