// services/productService.js
const cloudinary = require("cloudinary").v2;
const Product = require("../models/productModel");
const NotificationService = require("../services/notificationService");
const cloudinaryService = require("../middleware/cloudinary");

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

    // ✅ Gửi thông báo khi sản phẩm mới được thêm cho tất cả người dùng
    await NotificationService.createNotification({
      user: null,
      title: "Sản phẩm mới",
      message: `Quản trị viên Levents đã thêm sản phẩm ${newProduct.title}`,
      isGlobal: true,
      type: "product",
      productId: newProduct._id,
    });

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

// Hàm lấy sản phẩm theo id
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
const updateProductById = async (id, productData, files) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }
    // 🔥 1. Xóa ảnh cũ nếu người dùng yêu cầu
    const deletedImages = Array.isArray(productData.deletedImages)
      ? productData.deletedImages
      : [];

    if (deletedImages.length > 0) {
      for (const imageUrl of deletedImages) {
        await cloudinaryService.deleteImageFromCloudinary(imageUrl);
        product.images = product.images.filter((img) => img !== imageUrl);
      }
    }

    // 🔥 2. Upload ảnh mới nếu có
    let uploadedImages = [];
    if (files && Array.isArray(files)) {
      for (const file of files) {
        const imageUrl = await uploadImageToCloudinary(file);
        uploadedImages.push(imageUrl);
      }
    }

    // 🔥 3. Cập nhật danh sách ảnh mới
    product.images = [...product.images, ...uploadedImages];
    Object.assign(product, productData); // Cập nhật thông tin sản phẩm
    await product.save();
    return product;
  } catch (error) {
    throw new Error("Lỗi trong quá trình chỉnh sửa sản phẩm: " + error.message);
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
    await NotificationService.createNotification({
      user: userId,
      title: "Sản phẩm đã bị xóa",
      message: `Quản trị viên đã xóa sản phẩm ${product.title}`,
      isGlobal: true,
      type: "product",
      productId: product._id,
    });

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

const recommendByCategories = async (
  categories,
  limit = 6,
  additionalLimit
) => {
  // Lấy 1 món mới nhất mỗi category
  const onePerCategory = await Product.aggregate([
    { $match: { category: { $in: categories } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$category",
        product: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$product" } },
  ]);

  const idsTaken = onePerCategory.map((p) => p._id);

  // Nếu không truyền additionalLimit thì lấy đủ số còn lại để đủ limit
  const addLimit = additionalLimit ?? limit - onePerCategory.length;

  // Lấy thêm sản phẩm khác (không trùng), limit phù hợp
  const additionalProducts = await Product.find({
    category: { $in: categories },
    _id: { $nin: idsTaken },
  })
    .sort({ createdAt: -1 })
    .limit(addLimit)
    .exec();

  return [...onePerCategory, ...additionalProducts];
};
const recommendLichLam = () =>
  recommendByCategories(["Shirt", "Pants", "Jacket"]);
const recommendThoaiMai = () =>
  recommendByCategories(["T-Shirt", "Short", "Accessories"]);
const recommendNangDong = () =>
  recommendByCategories(["T-Shirt", "Jacket", "Short"]);
const recommendStreetStyle = () =>
  recommendByCategories(["Hat", "Jacket", "T-Shirt", "Accessories"], 6, 2);
const recommendToiGian = () => recommendByCategories(["T-Shirt", "Pants"]);
const recommendCongSo = () =>
  recommendByCategories(["Shirt", "Pants", "Accessories"]);
const recommendHienDai = () =>
  recommendByCategories(["Accessories", "Hat", "Jacket", "T-Shirt"]);

const intentToCategories = {
  recommendLichLam: ["Shirt", "Pants", "Jacket"], // Shirt + Pants => OK
  recommendThoaiMai: ["T-Shirt", "Short", "Accessories"], // T-Shirt + Short => OK
  recommendNangDong: ["T-Shirt", "Short", "Jacket"], // T-Shirt + Short => OK
  recommendStreetStyle: ["T-Shirt", "Short", "Jacket", "Accessories"], // T-Shirt + Short => OK
  recommendToiGian: ["T-Shirt", "Pants"], // T-Shirt + Pants => OK
  recommendCongSo: ["Shirt", "Pants", "Accessories"], // Shirt + Pants => OK
  recommendHienDai: ["T-Shirt", "Short", "Jacket", "Accessories", "Hat"], // T-Shirt + Short => OK
};

const recommendSetByBudget = async (intent, budget) => {
  const categories = intentToCategories[intent];
  if (!categories || !Array.isArray(categories)) {
    return []; // Nếu intent không hợp lệ hoặc chưa định nghĩa
  }

  const pantsCategories = ["Pants", "Short"];
  const shirtCategories = ["Shirt", "T-Shirt"];
  const accessoryCategories = ["Accessories"];
  const jacketCategories = ["Jacket"];
  const hatCategories = ["Hat"];

  const products = await Product.find({ category: { $in: categories } })
    .sort({ createdAt: -1 })
    .exec();
  console.log("Sản phẩm", products);

  const pants = products.filter((p) => pantsCategories.includes(p.category));
  const shirts = products.filter((p) => shirtCategories.includes(p.category));
  const accessories = products.filter((p) =>
    accessoryCategories.includes(p.category)
  );
  const jackets = products.filter((p) => jacketCategories.includes(p.category));
  const hats = products.filter((p) => hatCategories.includes(p.category));

  // Nếu không có áo hoặc không có quần thì không thể gợi ý
  if (pants.length === 0 || shirts.length === 0) return [];

  let bestPair = null;
  let bestPairPrice = 0;

  for (const pant of pants) {
    for (const shirt of shirts) {
      const total = pant.price + shirt.price;
      if (total <= budget && total > bestPairPrice) {
        bestPair = [pant, shirt];
        bestPairPrice = total;
      }
    }
  }

  // Nếu không tìm được cặp áo + quần nào trong ngân sách thì return []
  if (!bestPair) return [];

  let remainingBudget = budget - bestPairPrice;
  const additionalItems = [];

  const pickItem = (items) => {
    const affordable = items.filter(
      (item) =>
        item.price <= remainingBudget &&
        !additionalItems.includes(item) &&
        !bestPair.includes(item)
    );
    if (affordable.length === 0) return null;
    affordable.sort((a, b) => b.price - a.price);
    return affordable[0];
  };

  const groups = [accessories, jackets, hats];

  for (const group of groups) {
    let item = pickItem(group);
    while (item && remainingBudget >= item.price) {
      additionalItems.push(item);
      remainingBudget -= item.price;
      item = pickItem(group);
    }
  }

  return [...bestPair, ...additionalItems];
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
  recommendNangDong,
  recommendLichLam,
  recommendThoaiMai,
  recommendStreetStyle,
  recommendHienDai,
  recommendCongSo,
  recommendToiGian,
  recommendSetByBudget,
};
