// services/productService.js
const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const NotificationService = require("../services/notificationService");

const uploadImageToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products",
      use_filename: true, // Dùng tên file gốc
      unique_filename: false, // Không thêm chuỗi ngẫu nhiên
    });

    return {
      url: result.secure_url, // URL ảnh
      publicId: result.public_id, // public_id chính xác
    };
  } catch (error) {
    throw new Error("Lỗi khi upload ảnh lên Cloudinary: " + error.message);
  }
};
const addProduct = async (productData, files) => {
  try {
    if (files && files.length > 0) {
      // ✅ Upload ảnh song song để tối ưu tốc độ
      const imageUrls = await Promise.all(files.map(uploadImageToCloudinary));
      productData.images = imageUrls; // Lưu danh sách ảnh (URL + publicId)
    }

    const newProduct = new Product(productData); // Tạo mới sản phẩm
    await newProduct.save(); // Lưu vào DB

    // ✅ Gửi thông báo khi sản phẩm mới được thêm
    await NotificationService.notifyNewProduct(
      {
        productId: newProduct._id,
      },
      `🆕 Levents đã thêm một sản phẩm mới: ${newProduct.title}!`
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
const getProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const imageDetails = await Promise.all(
      product.images.map(async (imageUrl) => {
        try {
          // Lấy đúng public_id từ URL
          const regex = /\/v\d+\/([^/]+)\/([^/.]+)/;
          const match = imageUrl.match(regex);
          if (!match) throw new Error("Invalid Cloudinary URL");

          const publicId = `${match[1]}/${match[2]}`;

          // Gọi Cloudinary API để lấy thông tin ảnh
          const imageInfo = await cloudinary.api.resource(publicId);

          return {
            url: imageUrl,
            fileName: imageInfo.public_id.split("/").pop(),
            format: imageInfo.format,
            size: (imageInfo.bytes / 1024).toFixed(2) + " KB",
            dimensions: `${imageInfo.width}x${imageInfo.height} px`,
          };
        } catch (error) {
          console.error("Error fetching image details from Cloudinary:", error);
          return null;
        }
      })
    );

    return { ...product.toObject(), imageDetails };
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
const deleteProductById = async (id, userId) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new Error("Product not found");
    }
    // Gửi thông báo người dùng chỉnh sửa dữ liệu thành công
    await NotificationService.notifyOrderUpdate(
      null,
      userId,
      product._id,
      "✨ Bạn (Quản trị viên) vừa xóa sản phẩm thành công!",
      "product"
    );
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
