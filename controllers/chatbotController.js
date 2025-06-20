const responses = require("../constants/chatbotResponse");
const chatbotTrainService = require("../services/chatbotTrainService");
const recommendSystemService = require("../services/recommendSystemService");
const productService = require("../services/productService");
const { lang } = require("moment");

const redirectMap = {
  redirect_to_products: {
    path: "/levents/products",
    reply: "Đang chuyển bạn đến trang sản phẩm nhé!",
  },
  redirect_to_notification: {
    path: "/levents/profile/notifications",
    reply: "Đang chuyển bạn đến trang thông báo nhé!",
  },
  redirect_to_address: {
    path: "/levents/profile/address",
    reply: "Đang chuyển bạn đến trang quản lí địa chỉ nhé!",
  },
  redirect_to_change_password: {
    path: "/levents/profile/change-password",
    reply: "Đang chuyển bạn đến trang đổi mật khẩu nhé!",
  },
  redirect_to_login: {
    path: "/levents/login",
    reply: "Đang chuyển bạn đến trang đăng nhập nhé!",
    confirmMessage:
      "Mình không thể đăng nhập giúp bạn, nhưng có thể chuyển bạn đến trang đăng nhập. Bạn có muốn mình giúp không?",
  },
  redirect_to_register: {
    path: "/levents/register",
    reply: "Đang chuyển bạn đến trang đăng kí nhé!",
    confirmMessage: "Bạn muốn mình chuyển bạn đến trang đăng ký không?",
  },
  redirect_to_cart: {
    path: "/levents/cart",
    reply: "Đang chuyển bạn đến giỏ hàng nhé!",
    confirmMessage: "Bạn có muốn mình chuyển bạn đến giỏ hàng không?",
  },
  redirect_to_invoices: {
    path: "/levents/invoice",
    reply: "Đang chuyển bạn đến trang hóa đơn nhé!",
  },
  redirect_to_favorites: {
    path: "/levents/favorite",
    reply: "Đang chuyển bạn đến trang yêu thích nhé!",
  },
  redirect_to_profile: {
    path: "/levents/profile/view",
    reply: "Đang chuyển bạn đến trang cá nhân nhé!",
  },
};

// Map confirm context cho từng redirect intent, tiện cho xác nhận
const confirmContextMap = {
  redirect_to_login: "confirm_redirect_to_login",
  redirect_to_register: "confirm_redirect_to_register",
  redirect_to_cart: "confirm_redirect_to_cart",
};

function mapIntentToVietnamese(intent) {
  const intentToVietnamese = {
    recommendLichLam: "Lịch lãm",
    recommendThoaiMai: "Thoải mái",
    recommendNangDong: "Năng động",
    recommendStreetStyle: "Street Style",
    recommendToiGian: "Tối giản",
    recommendCongSo: "Công sở",
    recommendHienDai: "Hiện đại",
  };

  return intentToVietnamese[intent] || "Không xác định";
}

async function chatbotReply(req, res) {
  try {
    const { message } = req.body;
    const userId = req.user?._id || null;
    console.log("UserId:", userId);
    console.log("Message User:", message);
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message không được để trống",
      });
    }

    const height = extractHeightFromMessage(message);
    const weight = extractWeightFromMessage(message);
    if (height && weight) {
      return handleSuggestSize(height, weight, res);
    }

    const money = extractMoneyFromMessage(message);
    console.log("tiền:", money);

    const intentResult = await chatbotTrainService.getIntent(message);
    const intent = intentResult.intent;

    console.log("Intent Mapping from Message: ", intent);
    if (money) {
      return recommendSetByIntentAndBudget(req, res, intent, money);
    }

    switch (intent) {
      // Intent Default
      case "what_can_you_do":
      case "chatbot_info":
      case "bot_name":
      case "greeting":
      case "shop_info":
      case "goodbye":
      case "thanks":
      case "shop_style":
        return handleDefaultIntent(req, res, intent);

      // Intent Data
      case "top_search_products":
      case "product_inquiry":
        return handleProductIntent(req, res, intent, userId);

      // Intent Styles
      case "recommendLichLam":
      case "recommendThoaiMai":
      case "recommendNangDong":
      case "recommendStreetStyle":
      case "recommendToiGian":
      case "recommendCongSo":
      case "recommendHienDai":
        return handleStyleRecommendationIntent(req, res, intent);

      // Intent Redirect
      case "redirect_to_login":
      case "redirect_to_register":
      case "redirect_to_cart":
      case "redirect_to_products":
      case "redirect_to_invoices":
      case "redirect_to_favorites":
      case "redirect_to_profile":
      case "redirect_to_change_password":
      case "redirect_to_notification":
      case "redirect_to_address":
        return handleRedirectIntent(req, res, intent, userId);

      default:
        res.json({
          reply:
            "Xin lỗi, tôi không hiểu câu hỏi, vui lòng gửi lại câu hỏi khác!",
        });
    }
  } catch (error) {
    // Xử lí lỗi
    console.error("Lỗi chatbot:", error);
    return res.status(500).json({
      success: false,
      error: "Lỗi server khi xử lý chatbot",
    });
  }
}

// ====================== HANDLE INTENT ==================================
// Xử lí intent chung có mẫu câu trả về (reply, intent)
async function handleDefaultIntent(req, res, intent) {
  const reply =
    responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.";
  return res.json({ intent, reply });
}

// Xử lí intent liên quan đến height và weight
async function handleSuggestSize(height, weight, res) {
  const size = suggestSize(height, weight);
  const reply = size
    ? `📏 Với chiều cao ${height}cm và cân nặng ${weight}kg, size phù hợp với bạn có thể là **${size}** nhé!`
    : "Mình chưa thể xác định được size phù hợp, bạn vui lòng kiểm tra lại thông tin.";
  return res.json({ reply, height, weight, size });
}

// Xử lí tư vấn phong cách khi có tiền
const recommendSetByIntentAndBudget = async (req, res, intent, money) => {
  try {
    const products = await productService.recommendSetByBudget(intent, money);
    console.log("Sản phẩm gợi ý:", products);
    if (products.length === 0) {
      return res.json({
        reply: `Rất tiếc, hiện tại không tìm được bộ đồ phù hợp với ngân sách ${money.toLocaleString()}₫.`,
      });
    }

    return res.json({
      reply: `Gợi ý trang phục theo phong cách "${mapIntentToVietnamese(
        intent
      )}" với ngân sách ${money.toLocaleString()}₫:`,
      products,
    });
  } catch (err) {
    console.error("Lỗi khi gợi ý theo ngân sách:", err);
    return res.status(500).json({
      success: false,
      error: "Lỗi khi xử lý gợi ý theo ngân sách.",
    });
  }
};

// Xử lý các intent trả về gợi ý sản phẩm: top_search_products và product_inquiry
async function handleProductIntent(req, res, intent, userId) {
  try {
    let products = [];
    let reply = "";

    if (intent === "top_search_products") {
      if (userId) {
        products = await recommendSystemService.getContentBaseRecommendations(
          userId
        );
        reply =
          "🧐 Dưới đây là những sản phẩm bạn hay tìm kiếm nhất tại Levents. Hy vọng bạn sẽ thích! ✨\n\n👉 Bạn có thể click vào sản phẩm để xem chi tiết nhé!";
      } else {
        products =
          await recommendSystemService.getPersonalizedRecommendations();
        reply =
          "🔥 Đây là những sản phẩm đang cực kỳ được yêu thích tại Levents! Bạn không nên bỏ lỡ đâu 😉\n\n👉 Bạn có thể click vào sản phẩm để xem chi tiết nhé!";
      }
    } else if (intent === "product_inquiry") {
      if (userId) {
        products = await recommendSystemService.getRecommendations(userId);
        reply =
          "🤔 Bạn đang tìm kiếm sản phẩm nào? Dưới đây là một số gợi ý dành riêng cho bạn!\n\n👉 Bạn có thể click vào sản phẩm để xem chi tiết nhé!";
      } else {
        products =
          await recommendSystemService.getPersonalizedRecommendations();
        reply =
          "💡 Đây là những sản phẩm nổi bật đang được nhiều người quan tâm. Bạn thử tham khảo nhé!\n\n👉 Bạn có thể click vào sản phẩm để xem chi tiết nhé!";
      }
    }

    products = products.slice(0, 4);
    console.log(intent, reply);
    return res.json({ intent, reply, products });
  } catch (error) {
    console.error(`Lỗi khi xử lý intent ${intent}:`, error);
    return res.json({
      reply: "Xin lỗi, tôi chưa thể gợi ý sản phẩm lúc này 😥",
    });
  }
}

// Xử lí intent liên quan đến gợi ý theo phong cách
async function handleStyleRecommendationIntent(req, res, intent) {
  try {
    const mapping = {
      recommendLichLam: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendLichLam,
      },
      recommendThoaiMai: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendThoaiMai,
      },

      recommendNangDong: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendNangDong,
      },

      recommendStreetStyle: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendStreetStyle,
      },

      recommendToiGian: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendToiGian,
      },

      recommendCongSo: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendCongSo,
      },

      recommendHienDai: {
        reply:
          responses[intent] || "Xin lỗi, tôi không tìm thấy thông tin phù hợp.",
        handler: productService.recommendHienDai,
      },
    };

    const selected = mapping[intent];
    if (!selected) {
      return res.json({
        reply: "Xin lỗi, mình chưa có gợi ý cho phong cách này.",
      });
    }

    const products = await selected.handler();
    return res.json({
      intent,
      reply: selected.reply,
      products,
    });
  } catch (error) {
    console.error("Lỗi khi xử lý gợi ý phong cách:", error);
    return res.status(500).json({
      reply: "Xin lỗi, mình chưa thể gợi ý sản phẩm lúc này 😥",
    });
  }
}

// Xử lí intent liên quan đến redirect
function handleRedirectIntent(req, res, intent, userId) {
  const redirectData = redirectMap[intent];
  const confirmContext = confirmContextMap[intent] || null;

  if (!redirectData) {
    return res.json({
      reply: "Xin lỗi, mình chưa có đường dẫn cho chức năng này.",
    });
  }

  // Nếu intent yêu cầu xác nhận trước khi chuyển
  if (redirectData.confirmMessage) {
    // Gợi ý: Lưu context xác nhận vào session, cookie, hoặc DB nếu cần
    req.session = req.session || {};
    req.session.confirmContext = confirmContext;

    return res.json({
      reply: redirectData.confirmMessage,
      requireConfirmation: true, // frontend sẽ dùng flag này để hiển thị lựa chọn "Đồng ý"
      redirectPath: redirectData.path,
    });
  }

  // Nếu không cần xác nhận => trả phản hồi ngay
  return res.json({
    reply: redirectData.reply,
    redirectPath: redirectData.path,
  });
}

// --------- Hàm regex extract chiều cao -------
function extractHeightFromMessage(message) {
  const heightRegex =
    /(?:cao|chiều cao)?[^0-9]*(\d{3})\s*(?:cm)?|(\d)\s*m\s*(\d{2})?/i;
  const match = message.match(heightRegex);

  if (match) {
    if (match[1]) {
      return parseInt(match[1]);
    } else if (match[2]) {
      const meters = parseInt(match[2]);
      const centimeters = match[3] ? parseInt(match[3]) : 0;
      return meters * 100 + centimeters;
    }
  }
  return null;
}

// ----------- Hàm regex Money ------------
function extractMoneyFromMessage(message) {
  if (!message) return null;

  const text = message.toLowerCase();

  // Bắt "1 triệu rưỡi", "2 triệu rưỡi",...
  const millionWithHalfRegex = /(\d+)\s*(triệu|tr|m)\s*(rưỡi)/i;
  const millionRegex = /(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)/i;
  const thousandRegex = /(\d+(?:[.,]\d+)?)\s*(nghìn|ngàn|k)/i;
  const exactNumberRegex = /(\d{3,9})\s*(đ|vnd)?/i;

  let match;

  // Trường hợp "1 triệu rưỡi"
  if ((match = text.match(millionWithHalfRegex))) {
    const base = parseInt(match[1], 10);
    return base * 1_000_000 + 500_000;
  }

  // Trường hợp chỉ "1.5 triệu", "2 triệu"
  if ((match = text.match(millionRegex))) {
    const value = parseFloat(match[1].replace(",", "."));
    return Math.round(value * 1_000_000);
  }

  // Trường hợp "500 nghìn", "800k"
  if ((match = text.match(thousandRegex))) {
    const value = parseFloat(match[1].replace(",", "."));
    return Math.round(value * 1_000);
  }

  // Trường hợp số nguyên rõ ràng như "700000đ"
  if ((match = text.match(exactNumberRegex))) {
    return parseInt(match[1].replace(/\D/g, ""), 10);
  }

  return null;
}

// -------  Hàm regex extract cân nặng (cải tiến) -----------
function extractWeightFromMessage(message) {
  const weightRegex =
    /(?:nặng|cân nặng|tôi nặng)\s*[:\-]?\s*(\d{2,3})(?:\s*(?:kg|ký|kilo))?/i;
  const match = message.match(weightRegex);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

// ---------- Hàm gợi ý size dựa trên height, weight ---------------
function suggestSize(height, weight) {
  if (!height || !weight) return null;
  if (height < 160) {
    if (weight < 50) return "XS";
    if (weight <= 60) return "S";
    return "M";
  } else if (height < 170) {
    if (weight < 55) return "S";
    if (weight <= 65) return "M";
    return "L";
  } else if (height < 180) {
    if (weight < 60) return "M";
    if (weight <= 75) return "L";
    return "XL";
  } else {
    if (weight < 70) return "L";
    if (weight <= 85) return "XL";
    return "XXL";
  }
}

module.exports = {
  chatbotReply,
};
