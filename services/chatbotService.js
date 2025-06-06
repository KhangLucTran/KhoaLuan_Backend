const natural = require("natural");
const fs = require("fs");
const path = require("path");

let classifier = new natural.BayesClassifier();

function addDocuments() {
  // Thanks (Cảm ơn)
  classifier.addDocument("cảm ơn bạn nhiều lắm", "thanks");
  classifier.addDocument("cảm ơn bạn rất nhiều luôn", "thanks");
  classifier.addDocument("cảm ơn bạn, mình biết ơn lắm", "thanks");
  classifier.addDocument("thank you so much!", "thanks");
  classifier.addDocument("thanks a lot for your what_can_you_do", "thanks");
  classifier.addDocument("thank you very much", "thanks");
  classifier.addDocument("thanks a bunch", "thanks");

  // Goodbye (Tạm biệt)
  classifier.addDocument("tạm biệt", "goodbye");
  classifier.addDocument("bye", "goodbye");
  classifier.addDocument("hẹn gặp lại", "goodbye");
  classifier.addDocument("chào tạm biệt", "goodbye");
  classifier.addDocument("gặp lại sau nhé", "goodbye");
  classifier.addDocument("bye bye", "goodbye");
  classifier.addDocument("mình đi trước nhé", "goodbye");
  classifier.addDocument("tôi off đây", "goodbye");
  classifier.addDocument("goodbye", "goodbye");

  // What can you do? (Bạn có thể giúp gì?)
  classifier.addDocument("bạn có thể giúp gì cho tôi", "what_can_you_do");
  classifier.addDocument("bạn giúp được gì cho tôi", "what_can_you_do");
  classifier.addDocument("bạn có thể làm gì", "what_can_you_do");
  classifier.addDocument("bạn có thể hỗ trợ gì", "what_can_you_do");
  classifier.addDocument("bạn làm được gì", "what_can_you_do");
  classifier.addDocument("bạn hỗ trợ gì", "what_can_you_do");
  classifier.addDocument("bạn giúp được tôi việc gì", "what_can_you_do");

  // Greeting (Chào hỏi)
  classifier.addDocument("xin chào", "greeting");
  classifier.addDocument("chào bạn", "greeting");
  classifier.addDocument("hello", "greeting");
  classifier.addDocument("hey", "greeting");
  classifier.addDocument("alo", "greeting");
  classifier.addDocument("chào buổi sáng", "greeting");
  classifier.addDocument("chào buổi chiều", "greeting");
  classifier.addDocument("chào buổi tối", "greeting");
  classifier.addDocument("chào mọi người", "greeting");
  classifier.addDocument("xin chào mọi người", "greeting");
  classifier.addDocument("chào bạn ơi", "greeting");

  // Sản phẩm mua nhiều nhất
  // Các câu mẫu để phân loại intent "top_search_products"
  classifier.addDocument("sản phẩm tìm kiếm nhiều nhất", "top_search_products");
  classifier.addDocument(
    "những sản phẩm được tìm kiếm nhiều nhất",
    "top_search_products"
  );
  classifier.addDocument("sản phẩm hot nhất", "top_search_products");
  classifier.addDocument("sản phẩm phổ biến nhất", "top_search_products");
  classifier.addDocument("sản phẩm được tìm kiếm nhiều", "top_search_products");

  // Buy shirt (Mua áo: sơ mi, thun)
  classifier.addDocument("tôi muốn mua áo", "buy_shirt");
  classifier.addDocument("cho tôi xem các mẫu áo", "buy_shirt");
  classifier.addDocument("có áo mới không?", "buy_shirt");
  classifier.addDocument("áo sơ mi", "buy_shirt");
  classifier.addDocument("áo thun", "buy_shirt");
  classifier.addDocument("bán áo không?", "buy_shirt");
  classifier.addDocument("có áo đẹp không?", "buy_shirt");
  classifier.addDocument("muốn xem áo nam", "buy_shirt");
  classifier.addDocument("áo nữ có không?", "buy_shirt");
  classifier.addDocument("áo đi chơi có không?", "buy_shirt");
  classifier.addDocument("áo công sở có không?", "buy_shirt");
  classifier.addDocument("áo phông nữ", "buy_shirt");
  classifier.addDocument("áo phông nam", "buy_shirt");
  classifier.addDocument("tìm áo sơ mi trắng", "buy_shirt");
  classifier.addDocument("áo thun trơn", "buy_shirt");
  classifier.addDocument("tôi cần áo form rộng", "buy_shirt");

  // Buy pants (Mua quần ngắn / dài)
  classifier.addDocument("cho tôi xem quần", "buy_pants");
  classifier.addDocument("có quần ngắn không?", "buy_pants");
  classifier.addDocument("tôi cần quần short", "buy_pants");
  classifier.addDocument("bán quần dài không?", "buy_pants");
  classifier.addDocument("quần jean nam", "buy_pants");
  classifier.addDocument("quần ống rộng nữ", "buy_pants");
  classifier.addDocument("quần đi chơi có không?", "buy_pants");
  classifier.addDocument("quần công sở có không?", "buy_pants");
  classifier.addDocument("tìm quần short nữ", "buy_pants");
  classifier.addDocument("quần dài kaki", "buy_pants");
  classifier.addDocument("quần thun nam", "buy_pants");
  classifier.addDocument("tôi muốn mua quần thể thao", "buy_pants");
  classifier.addDocument("quần ống đứng", "buy_pants");
  classifier.addDocument("quần tây nữ", "buy_pants");

  // Order status (Trạng thái đơn hàng)
  classifier.addDocument("đơn hàng của tôi đâu", "order_status");
  classifier.addDocument("theo dõi đơn hàng", "order_status");
  classifier.addDocument("xem trạng thái đơn hàng", "order_status");
  classifier.addDocument("tình trạng đơn hàng của tôi", "order_status");
  classifier.addDocument("đơn hàng đã gửi chưa?", "order_status");
  classifier.addDocument("đơn hàng đang ở đâu?", "order_status");
  classifier.addDocument("khi nào nhận được hàng?", "order_status");
  classifier.addDocument("đơn hàng của tôi lúc nào giao?", "order_status");
  classifier.addDocument("kiểm tra đơn hàng giúp tôi", "order_status");

  // Cancel order (Hủy đơn hàng)
  classifier.addDocument("tôi muốn hủy đơn", "cancel_order");
  classifier.addDocument("hủy đơn hàng được không?", "cancel_order");
  classifier.addDocument("làm sao để hủy đơn?", "cancel_order");
  classifier.addDocument("đổi đơn hàng", "cancel_order");
  classifier.addDocument("thay đổi đơn hàng", "cancel_order");
  classifier.addDocument("tôi muốn thay đổi đơn hàng", "cancel_order");
  classifier.addDocument("đơn hàng muốn hủy", "cancel_order");
  classifier.addDocument("có thể hủy đơn hàng không?", "cancel_order");

  // Chatbot info (Thông tin về chatbot)
  classifier.addDocument("bạn là ai", "chatbot_info");
  classifier.addDocument("giới thiệu bản thân đi", "chatbot_info");
  classifier.addDocument("bạn được tạo ra để làm gì", "chatbot_info");

  // Product inquiry (Tham khảo sản phẩm)
  classifier.addDocument("tôi muốn xem sản phẩm", "product_inquiry");
  classifier.addDocument("có sản phẩm nào mới không?", "product_inquiry");
  classifier.addDocument(
    "bạn có thể giới thiệu sản phẩm không?",
    "product_inquiry"
  );
  classifier.addDocument(
    "muốn tham khảo các mẫu thời trang",
    "product_inquiry"
  );
  classifier.addDocument("tham khảo sản phẩm", "product_inquiry");
  classifier.addDocument("sản phẩm hot nhất là gì?", "product_inquiry");
  classifier.addDocument("cho tôi xem các sản phẩm", "product_inquiry");
  classifier.addDocument("sản phẩm mới về hôm nay", "product_inquiry");
  classifier.addDocument("sản phẩm đang bán chạy", "product_inquiry");
  classifier.addDocument("giới thiệu các mặt hàng", "product_inquiry");
  classifier.addDocument("bạn có sản phẩm nào nổi bật?", "product_inquiry");

  // Recommend products (Gợi ý sản phẩm, sản phẩm nổi bật, hot, bán chạy)
  classifier.addDocument("sản phẩm hot nhất là gì?", "product_inquiry");
  classifier.addDocument("có sản phẩm nào nổi bật không?", "product_inquiry");
  classifier.addDocument("sản phẩm đang bán chạy", "product_inquiry");
  classifier.addDocument(
    "bạn có thể giới thiệu sản phẩm nổi bật không?",
    "product_inquiry"
  );
  classifier.addDocument("cho tôi xem sản phẩm được gợi ý", "product_inquiry");
  classifier.addDocument(
    "bạn có thể gợi ý sản phẩm cho tôi?",
    "product_inquiry"
  );
  classifier.addDocument(
    "có sản phẩm nào mới về hôm nay không?",
    "product_inquiry"
  );

  // Promotions (Khuyến mãi)
  classifier.addDocument("mã giảm giá", "promo");
  classifier.addDocument("coupon có không?", "promo");
  classifier.addDocument("voucher khuyến mãi", "promo");
  classifier.addDocument("ưu đãi đặc biệt hôm nay", "promo");
  classifier.addDocument("deal hot", "promo");
  classifier.addDocument("khuyến mãi hôm nay", "promo");
  classifier.addDocument("giảm giá sản phẩm", "promo");
  classifier.addDocument("có ưu đãi nào không?", "promo");

  // Return & Warranty (Đổi trả, bảo hành)
  classifier.addDocument("đổi hàng bị lỗi", "return_warranty");
  classifier.addDocument("bảo hành sản phẩm như thế nào?", "return_warranty");
  classifier.addDocument("sản phẩm lỗi thì làm sao?", "return_warranty");
  classifier.addDocument("hướng dẫn đổi trả", "return_warranty");
  classifier.addDocument("làm sao để bảo hành?", "return_warranty");
  classifier.addDocument("thời gian bảo hành là bao lâu?", "return_warranty");
  classifier.addDocument("đổi hàng được không?", "return_warranty");

  // Shop info (Thông tin shop)
  classifier.addDocument("shop là gì?", "shop_info");
  classifier.addDocument("về shop", "shop_info");
  classifier.addDocument("thông tin shop", "shop_info");
  classifier.addDocument("thương hiệu của shop", "shop_info");
  classifier.addDocument("địa chỉ cửa hàng ở đâu?", "shop_info");
  classifier.addDocument("giờ mở cửa shop là khi nào?", "shop_info");
  classifier.addDocument("liên hệ shop thế nào?", "shop_info");
  classifier.addDocument("shop Levents ở đâu?", "shop_info");
  classifier.addDocument("shop Levents có gì đặc biệt?", "shop_info");
  classifier.addDocument("mua hàng ở Levents như thế nào?", "shop_info");

  // Redirect to products page
  classifier.addDocument(
    "hãy chuyển tôi đến trang sản phẩm",
    "redirect_to_products"
  );
  classifier.addDocument("đưa tôi đến trang sản phẩm", "redirect_to_products");
  classifier.addDocument("mở trang sản phẩm", "redirect_to_products");
  classifier.addDocument("tôi muốn xem sản phẩm", "redirect_to_products");

  // Redirect to cart page
  classifier.addDocument("hãy chuyển tôi đến giỏ hàng", "redirect_to_cart");
  classifier.addDocument("đưa tôi đến giỏ hàng", "redirect_to_cart");
  classifier.addDocument("mở giỏ hàng", "redirect_to_cart");
  classifier.addDocument("tôi muốn xem giỏ hàng", "redirect_to_cart");

  // Redirect to invoice/orders page
  classifier.addDocument(
    "hãy chuyển tôi đến trang hóa đơn",
    "redirect_to_invoices"
  );
  classifier.addDocument("tôi muốn xem trang hóa đơn", "redirect_to_invoices");

  // Redirect to favorites page
  classifier.addDocument(
    "hãy chuyển tôi đến trang yêu thích",
    "redirect_to_favorites"
  );
  classifier.addDocument(
    "đưa tôi đến trang yêu thích",
    "redirect_to_favorites"
  );
  classifier.addDocument("mở trang yêu thích", "redirect_to_favorites");
  classifier.addDocument(
    "tôi muốn xem trang yêu thích",
    "redirect_to_favorites"
  );

  // Redirect to profile page
  classifier.addDocument(
    "hãy chuyển tôi đến trang cá nhân",
    "redirect_to_profile"
  );
  classifier.addDocument("đưa tôi đến trang cá nhân", "redirect_to_profile");
  classifier.addDocument("mở trang cá nhân", "redirect_to_profile");
  classifier.addDocument("tôi muốn xem trang cá nhân", "redirect_to_profile");

  // Redirect_to_register
  classifier.addDocument(
    "hãy chuyển tôi đến trang đăng ký",
    "redirect_to_register"
  );
  classifier.addDocument("đưa tôi đến trang đăng ký", "redirect_to_register");
  classifier.addDocument("mở trang đăng ký", "redirect_to_register");
  classifier.addDocument("tôi muốn tạo tài khoản", "redirect_to_register");
  classifier.addDocument("tôi muốn đăng ký", "redirect_to_register");
  classifier.addDocument("cho tôi đăng ký tài khoản", "redirect_to_register");

  // Redirect to loginPage
  classifier.addDocument(
    "hãy chuyển tôi đến trang đăng nhập",
    "redirect_to_login"
  );
  classifier.addDocument("đưa tôi đến trang đăng nhập", "redirect_to_login");
  classifier.addDocument("mở trang đăng nhập", "redirect_to_login");
  classifier.addDocument("tôi muốn đăng nhập", "redirect_to_login");
  classifier.addDocument("tôi muốn vào trang đăng nhập", "redirect_to_login");
  classifier.addDocument(
    "bạn có thể đăng nhập giúp tôi không",
    "redirect_to_login"
  );
  classifier.addDocument("chuyển tôi tới phần đăng nhập", "redirect_to_login");
  classifier.addDocument("mình cần đăng nhập", "redirect_to_login");
  classifier.addDocument("mình muốn vào tài khoản", "redirect_to_login");
  classifier.addDocument("đăng nhập giùm mình", "redirect_to_login");
  classifier.addDocument("tôi cần đăng nhập để mua hàng", "redirect_to_login");

  // What can you do? (Bạn có thể giúp gì?)
  classifier.addDocument("bạn có thể giúp gì cho tôi", "what_can_you_do");
  classifier.addDocument("bạn giúp được gì cho tôi", "what_can_you_do");
  classifier.addDocument("bạn có thể làm gì", "what_can_you_do");
  classifier.addDocument("bạn có thể hỗ trợ gì", "what_can_you_do");
  classifier.addDocument("bạn làm được gì", "what_can_you_do");
  classifier.addDocument("bạn biết làm gì", "what_can_you_do");
  classifier.addDocument("bạn có thể giúp gì?", "what_can_you_do");
  classifier.addDocument("tôi cần hỗ trợ", "what_can_you_do");
  classifier.addDocument("tôi không biết phải làm sao", "what_can_you_do");
  classifier.addDocument("hướng dẫn sử dụng", "what_can_you_do");
  classifier.addDocument("tôi cần tư vấn", "what_can_you_do");
  classifier.addDocument("giúp tôi với", "what_can_you_do");
  classifier.addDocument("bạn hỗ trợ gì", "what_can_you_do");
  classifier.addDocument("bạn có chức năng gì", "what_can_you_do");
  classifier.addDocument("bạn giúp được tôi việc gì", "what_can_you_do");
  classifier.addDocument("tôi cần bạn làm gì", "what_can_you_do");

  for (const [label, keywords] of Object.entries(styles)) {
    for (const keyword of keywords) {
      for (const template of baseTemplates) {
        const sentence = template.replace("{style}", keyword);
        classifier.addDocument(sentence, label);
      }
    }
  }
}
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

// Load mô hình đã lưu
async function loadClassifier() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "classifier.json");
    if (fs.existsSync(filePath)) {
      natural.BayesClassifier.load(filePath, null, (err, loadedClassifier) => {
        if (err) return reject(err);
        classifier = loadedClassifier;
        console.log("✅ Classifier đã được load thành công");
        resolve();
      });
    } else {
      reject(new Error("Classifier file not found"));
    }
  });
}
// Huấn luyện và lưu classifier mới
async function trainAndSave() {
  return new Promise((resolve, reject) => {
    addDocuments();
    classifier.train();
    classifier.save(path.join(__dirname, "classifier.json"), (err) => {
      if (err) {
        console.error("Lỗi khi lưu mô hình:", err);
        return reject(err);
      }
      console.log("✅ Lưu mô hình classifier thành công!");
      resolve();
    });
  });
}

// Hàm nhận message, trả về intent
// Lấy intent dựa trên message
async function getIntent(message) {
  if (!classifier) {
    throw new Error("Classifier chưa được load hoặc huấn luyện");
  }
  return classifier.classify(message);
}

module.exports = {
  trainAndSave,
  loadClassifier,
  getIntent,
};
