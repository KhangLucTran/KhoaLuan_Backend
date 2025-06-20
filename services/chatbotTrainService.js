const fs = require("fs");
const path = require("path");
const { NlpManager } = require("node-nlp");

const MODEL_PATH = path.join(__dirname, "model");

let manager; // Khởi tạo sau

// Thêm các câu mẫu (documents) cho các intent
function addDocuments() {
  // Thanks
  manager.addDocument("vi", "cảm ơn bạn nhiều lắm", "thanks");
  manager.addDocument("vi", "cảm ơn bạn rất nhiều luôn", "thanks");
  manager.addDocument("vi", "cảm ơn bạn, mình biết ơn lắm", "thanks");
  manager.addDocument("en", "thank you so much!", "thanks");
  manager.addDocument("en", "thanks a lot for your what_can_you_do", "thanks");
  manager.addDocument("en", "thank you very much", "thanks");
  manager.addDocument("en", "thanks a bunch", "thanks");

  // Goodbye
  [
    "tạm biệt",
    "bye",
    "hẹn gặp lại",
    "chào tạm biệt",
    "gặp lại sau nhé",
    "bye bye",
    "mình đi trước nhé",
    "tôi off đây",
    "goodbye",
  ].forEach((text) => manager.addDocument("vi", text, "goodbye"));

  // What can you do?
  [
    "bạn có thể giúp gì cho tôi",
    "bạn giúp được gì cho tôi",
    "bạn có thể làm gì",
    "bạn có thể hỗ trợ gì",
    "bạn làm được gì",
    "bạn hỗ trợ gì",
    "bạn giúp được tôi việc gì",
  ].forEach((text) => manager.addDocument("vi", text, "what_can_you_do"));

  // Greeting
  [
    "xin chào",
    "chào bạn",
    "hello",
    "hey",
    "alo",
    "chào buổi sáng",
    "chào buổi chiều",
    "chào buổi tối",
    "chào mọi người",
    "xin chào mọi người",
    "chào bạn ơi",
  ].forEach((text) => manager.addDocument("vi", text, "greeting"));

  // Top search products
  [
    "sản phẩm tìm kiếm nhiều nhất",
    "những sản phẩm được tìm kiếm nhiều nhất",
    "sản phẩm hot nhất",
    "sản phẩm phổ biến nhất",
    "sản phẩm được tìm kiếm nhiều",
  ].forEach((text) => manager.addDocument("vi", text, "top_search_products"));

  // Shop info (Thông tin shop)
  [
    "shop là gì?",
    "về shop",
    "thông tin shop",
    "thương hiệu của shop",
    "địa chỉ cửa hàng ở đâu?",
    "giờ mở cửa shop là khi nào?",
    "liên hệ shop thế nào?",
    "shop Levents ở đâu?",
    "shop Levents có gì đặc biệt?",
    "mua hàng ở Levents như thế nào?",
  ].forEach((text) => manager.addDocument("vi", text, "shop_info"));

  // bot_name
  [
    "bot tên gì?",
    "bạn là ai?",
    "tên của bạn là gì?",
    "chatbot tên gì?",
    "bạn tên gì vậy?",
  ].forEach((text) => manager.addDocument("vi", text, "bot_name"));
  [
    "shop theo phong cách gì?",
    "phong cách thời trang của shop là gì?",
    "shop bán đồ theo style nào?",
    "phong cách của shop như thế nào?",
    "shop phù hợp với phong cách nào?",
    "đồ ở shop hợp với style gì?",
    "shop bán theo xu hướng nào?",
    "shop có theo phong cách streetwear không?",
    "shop có bán đồ basic không?",
    "shop có style trẻ trung không?",
    "shop hướng đến phong cách nào?",
    "shop có nhiều style khác nhau không?",
  ].forEach((text) => manager.addDocument("vi", text, "shop_style"));
  // Redirect to products page
  [
    "hãy chuyển tôi đến trang sản phẩm",
    "đưa tôi đến trang sản phẩm",
    "mở trang sản phẩm",
    "tôi muốn xem sản phẩm",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_products"));

  // Redirect to cart page
  [
    "hãy chuyển tôi đến giỏ hàng",
    "đưa tôi đến giỏ hàng",
    "mở giỏ hàng",
    "tôi muốn xem giỏ hàng",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_cart"));

  // Redirect to invoice/orders page
  ["hãy chuyển tôi đến trang hóa đơn", "tôi muốn xem trang hóa đơn"].forEach(
    (text) => manager.addDocument("vi", text, "redirect_to_invoices")
  );

  // Redirect to favorites page
  [
    "hãy chuyển tôi đến trang yêu thích",
    "đưa tôi đến trang yêu thích",
    "mở trang yêu thích",
    "tôi muốn xem trang yêu thích",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_favorites"));

  // Redirect to profile page
  [
    "hãy chuyển tôi đến trang cá nhân",
    "đưa tôi đến trang cá nhân",
    "mở trang cá nhân",
    "tôi muốn xem trang cá nhân",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_profile"));

  // Redirect to register
  [
    "hãy chuyển tôi đến trang đăng ký",
    "đưa tôi đến trang đăng ký",
    "mở trang đăng ký",
    "tôi muốn tạo tài khoản",
    "tôi muốn đăng ký",
    "cho tôi đăng ký tài khoản",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_register"));

  // Redirect to login page
  [
    "hãy chuyển tôi đến trang đăng nhập",
    "đưa tôi đến trang đăng nhập",
    "mở trang đăng nhập",
    "tôi muốn đăng nhập",
    "tôi muốn vào trang đăng nhập",
    "bạn có thể đăng nhập giúp tôi không",
    "chuyển tôi tới phần đăng nhập",
    "mình cần đăng nhập",
    "mình muốn vào tài khoản",
    "đăng nhập giùm mình",
    "tôi cần đăng nhập để mua hàng",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_login"));

  // Redirect to notifications page
  [
    "hãy chuyển tôi đến trang thông báo",
    "đưa tôi đến trang thông báo",
    "mở trang thông báo",
    "tôi muốn xem thông báo",
    "tôi muốn vào trang thông báo",
  ].forEach((text) =>
    manager.addDocument("vi", text, "redirect_to_notifications")
  );

  // Redirect to change password page
  [
    "hãy chuyển tôi đến trang đổi mật khẩu",
    "đưa tôi đến trang đổi mật khẩu",
    "mở trang đổi mật khẩu",
    "tôi muốn đổi mật khẩu",
    "tôi muốn thay đổi mật khẩu",
  ].forEach((text) =>
    manager.addDocument("vi", text, "redirect_to_change_password")
  );

  // Redirect to address page
  [
    "hãy chuyển tôi đến trang địa chỉ",
    "đưa tôi đến trang địa chỉ",
    "mở trang địa chỉ",
    "tôi muốn xem địa chỉ",
    "tôi muốn quản lý địa chỉ",
  ].forEach((text) => manager.addDocument("vi", text, "redirect_to_address"));
}

// Thêm các câu mẫu về phong cách (style)
function addStyleDocuments() {
  const styles = {
    recommendLichLam: [
      "lịch lãm",
      "quý ông",
      "sang trọng",
      "đẳng cấp",
      "trưởng thành",
      "điềm đạm",
    ],
    recommendThoaiMai: ["thoải mái"],
    recommendNangDong: ["năng động", "thể thao"],
    recommendStreetStyle: ["street style", "phá cách"],
    recommendToiGian: ["tối giản", "đơn giản", "minimalism"],
    recommendCongSo: ["công sở", "lịch sự", "đi làm"],
    recommendHienDai: ["hiện đại", "trẻ trung"],
  };

  const baseTemplates = [
    "tôi muốn xem phong cách {style}",
    "cho tôi gợi ý đồ {style}",
    "tư vấn cho tôi phong cách {style}",
    "đồ thời trang {style} là gì",
    "tôi thích mặc đồ {style}",
    "tôi muốn phong cách {style}",
  ];

  for (const [label, keywords] of Object.entries(styles)) {
    for (const keyword of keywords) {
      for (const template of baseTemplates) {
        const sentence = template.replace("{style}", keyword);
        manager.addDocument("vi", sentence, label);
      }
    }
  }
}

// Huấn luyện và lưu mô hình
async function trainAndSave() {
  manager = new NlpManager({ languages: ["vi", "en"], forceNER: true }); // Tạo mới để tránh trùng dữ liệu
  addDocuments();
  addStyleDocuments();
  console.log("🚀 Đang huấn luyện mô hình...");
  await manager.train();
  await manager.save(MODEL_PATH);
  console.log("✅ Đã huấn luyện và lưu mô hình NLP thành công!");
}

// Tải mô hình từ file
async function loadModel() {
  if (fs.existsSync(MODEL_PATH)) {
    manager = new NlpManager({ languages: ["vi", "en"], forceNER: true });
    await manager.load(MODEL_PATH);
    console.log("✅ Đã tải mô hình NLP thành công!");
  } else {
    throw new Error("❌ Không tìm thấy file model NLP");
  }
}

// Dự đoán intent của câu nhập vào
// Có thể truyền ngôn ngữ, mặc định là "vi"
async function getIntent(message, lang = "vi") {
  if (!manager) throw new Error("Mô hình NLP chưa được khởi tạo");
  if (!message || typeof message !== "string" || message.trim() === "") {
    return { intent: "None", score: 0, answer: null, entities: [] };
  }
  console.log("Message trong chatbot:", message);
  const result = await manager.process(lang, message);
  return {
    intent: result.intent,
    score: result.score,
    answer: result.answer || null,
    entities: result.entities || [],
  };
}

module.exports = {
  trainAndSave,
  loadModel,
  getIntent,
};
