const commentService = require("../services/commentService");
const invoiceService = require("../services/invoiceService");

// Hàm thêm comment
const addCommentController = async (req, res) => {
  const { productId, message, images, rating } = req.body;
  console.log("ProductId:", productId);
  const userId = req.user._id;
  console.log("UserId:", userId);
  try {
    // Kiểm tra user có mua sản phẩm này hay chưa
    const checkValid = await invoiceService.findInvoiceByUserAndProduct(
      userId,
      productId
    );
    console.log("checkValid:", checkValid);
    if (!checkValid) {
      return res.status(400).json({
        message: "Vui lòng mua sản phẩm trước khi đánh giá sản phẩm.",
      });
    }

    // Nếu đã mua, cho phép tạo bình luận
    const comment = await commentService.addComment(userId, productId, {
      message,
      images,
      rating,
    });

    res.status(201).json({
      message: "Đã thêm bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Hàm lấy tất cả comment
const getCommentsByProductController = async (req, res) => {
  const { productId } = req.params;
  try {
    const comments = await commentService.getCommentsByProduct(productId);
    res.status(200).json({
      message: "Danh sách bình luận.",
      data: comments,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hàm xóa commnet
const deleteCommentController = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await commentService.deleteCommentById(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bình luận để xóa." });
    }

    res.status(200).json({
      message: "Đã xóa bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  addCommentController,
  getCommentsByProductController,
  deleteCommentController,
};
