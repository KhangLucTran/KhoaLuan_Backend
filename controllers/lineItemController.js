const LineItemService = require("../services/lineItemService");

// Hàm Controller "Tạo LineItem"
const createLineItemController = async (req, res) => {
  try {
    // Kiểm tra các trường trong body
    const { product, quantity, price, size, color, gender } = req.body;
    if (!product || !quantity || !price || !size || !color || !gender) {
      return res.status(400).json({
        message:
          "Missing required fields: product, quantity, and price are required.",
      });
    }

    // Tạo LineItem mới
    const lineItem = await LineItemService.createLineItem(req, res);
    const lineItemJson = JSON.parse(JSON.stringify(lineItem));
    // Trả về LineItem đã tạo
    return res.status(201).json({
      message: "LineItem created successfully",
      lineItem: lineItemJson,
    });
  } catch (error) {
    console.error(error);
    // Đảm bảo không gọi response nhiều lần
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// Hàm Controller "Lấy LineItem theo id"
const getLineItemController = async (req, res) => {
  try {
    const lineItem = await LineItemService.getLineItemById(req.params.id);
    res.status(200).json(lineItem);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Hàm Controller "Xóa LineItem"
const deleteLineItemController = async (req, res) => {
  try {
    await LineItemService.deleteLineItem(req.params.id);
    res.status(200).json({ message: "LineItem deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Hàm Controller "Chỉnh sửa LineItem"
const updateLineItemController = async (req, res) => {
  try {
    const updatedLineItem = await LineItemService.updateLineItem(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedLineItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createLineItemController,
  getLineItemController,
  deleteLineItemController,
  updateLineItemController,
};
