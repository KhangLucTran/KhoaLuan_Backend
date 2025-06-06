// controllers/productController.js
const productService = require("../services/productService");

const addProductController = async (req, res) => {
  try {
    const productData = req.body; // Dữ liệu sản phẩm từ body
    const files = req.files; // Mảng các ảnh tải lên từ client
    console.log(
      "📌 Request nhận được ở Add product:",
      req.params,
      req.body,
      req.files
    );
    // Kiểm tra nếu không có ảnh nào được tải lên
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Lấy URL của các ảnh đã tải lên
    const imageUrls = [];
    for (let i = 0; i < files.length; i++) {
      const imageUrl = files[i].path; // Đường dẫn tới ảnh trên Cloudinary
      imageUrls.push(imageUrl);
    }

    // Thêm các URL ảnh vào dữ liệu sản phẩm
    productData.images = imageUrls;

    // Gọi service để thêm sản phẩm với ảnh
    const newProduct = await productService.addProduct(productData);

    res.status(201).json(newProduct); // Trả về sản phẩm mới
  } catch (error) {
    res.status(500).json({ message: error.message }); // Lỗi server
  }
};

const deleteProductByTitleController = async (req, res) => {
  const { title } = req.params;

  try {
    const deletedProduct = await productService.deleteProductByTitle(title);
    return res.status(200).json({
      message: "Sản phẩm đã được xóa thành công.",
      product: deletedProduct,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Không thể xóa sản phẩm.",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductByIdController = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateProductById = async (req, res) => {
  try {
    console.log("📌 Request nhận được:", req.params, req.body, req.files);
    const productId = req.params.id;
    const productData = req.body;
    const files = req.files;

    // Lấy danh sách ảnh từ Cloudinary
    let imageUrls = productData.images ? [...productData.images] : [];
    // Nếu có ảnh mới, thêm vào danh sách
    if (files && files.length > 0) {
      const uploadedUrls = files.map((file) => file.path);
      imageUrls = [...imageUrls, ...uploadedUrls];
    }
    // Nếu có ảnh bị xóa, loại bỏ khỏi danh sách
    if (productData.deletedImages) {
      const deletedImages = Array.isArray(productData.deletedImages)
        ? productData.deletedImages
        : [productData.deletedImages];

      imageUrls = imageUrls.filter((url) => !deletedImages.includes(url));
    }
    // Cập nhật dữ liệu sản phẩm với danh sách ảnh mới
    productData.images = imageUrls;

    // Gọi service để cập nhật sản phẩm
    const updatedProduct = await productService.updateProductById(
      productId,
      productData
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProductByIdController = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedProduct = await productService.deleteProductById(
      req.params.id,
      userId
    );
    res
      .status(200)
      .json({ message: "Product deleted", product: deletedProduct });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getProductByCategoryController = async (req, res) => {
  try {
    const category = req.query.category;
    const result = await productService.getProductByCategory(category);
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    res.status(200).json({ message: "Product other", product: result });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  addProductController,
  getAllProducts,
  getProductByIdController,
  updateProductById,
  deleteProductByIdController,
  deleteProductByTitleController,
  getProductByCategoryController,
};
