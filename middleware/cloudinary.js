const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Cấu hình CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowedFormats: ["jpg", "jpeg", "png", "gif", "webp", "avif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => Date.now().toString(), // Tránh trùng tên
  },
});

// Middleware upload sử dụng `multer`
const uploadCloud = multer({ storage });

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const urlParts = imageUrl.split("/");
    const fileNameWithExtension = decodeURIComponent(urlParts.pop()); // Giải mã URL
    const folderName = decodeURIComponent(urlParts.pop());
    const fileName = fileNameWithExtension.split(".")[0]; // "img2"

    const publicId = `${folderName}/${fileName}`;
    console.log("🛠 Public ID để xóa:", publicId);

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("❌ Lỗi khi xóa ảnh từ Cloudinary:", error.message);
  }
};

module.exports = { uploadCloud, deleteImageFromCloudinary };
