const responses = {
  what_can_you_do:
    "🤖 Mình có thể giúp bạn những việc sau:\n" +
    "1. 📦 Kiểm tra trạng thái đơn hàng\n" +
    "2. 👕 Gợi ý size dựa trên chiều cao, cân nặng\n" +
    "3. 🔍 Tìm sản phẩm theo sở thích\n" +
    "4. 🛒 Điều hướng đến trang giỏ hàng, yêu thích, hóa đơn, đăng nhập,...\n" +
    "5. 🎁 Hiển thị các chương trình khuyến mãi hiện có\n" +
    "6. ❓ Trả lời các câu hỏi về cửa hàng, hỗ trợ, và thông tin sản phẩm\n\n" +
    "💬 Bạn muốn mình giúp gì cụ thể hơn không?",

  top_search_products:
    "🔎 Đây là những sản phẩm được tìm kiếm nhiều nhất trên Levents hiện nay. Bạn có thể xem chi tiết bằng cách click vào sản phẩm dưới đây 👇",

  greeting:
    "👋 Xin chào! Mình là Kbot – trợ lý ảo của Levents. Rất vui được đồng hành cùng bạn hôm nay! Bạn cần hỗ trợ gì không? 😊",

  greeting_time_of_day:
    "🌞 Chào bạn! Chúc bạn một ngày tuyệt vời và nếu cần gì cứ hỏi tôi nhé! 💬",

  product_inquiry:
    "🛍️ Levents có nhiều sản phẩm thời trang đa dạng và phong phú như đầm, giày, áo khoác,... Bạn muốn mình giới thiệu loại nào không? 👗👠🧥",

  goodbye:
    "👋 Cảm ơn bạn đã ghé thăm Levents! Chúc bạn một ngày tốt lành và hẹn gặp lại bạn lần sau! 💖",

  end_conversation:
    "📩 Nếu bạn cần hỗ trợ thêm, đừng ngần ngại quay lại nhé. Chúc bạn vui vẻ! 😊",

  shop_info:
    "🛍️ **Levents** là thương hiệu thời trang trẻ trung, năng động và hiện đại.\n✨ Chúng tôi cung cấp đa dạng sản phẩm từ áo thun, áo khoác, quần jeans đến phụ kiện.\n🔍 Luôn cập nhật xu hướng mới nhất giúp bạn thể hiện cá tính qua từng set đồ.\n🤝 Trải nghiệm mua sắm thân thiện, dịch vụ tận tâm, giá cả hợp lý.",

  buy_shirt:
    "👔 Chúng tôi có nhiều mẫu áo sơ mi từ dạo phố đến công sở và dự tiệc. Bạn muốn xem kiểu nào?",

  product_shoes:
    "👟 Shop có các loại giày thể thao, sneaker năng động và cả giày cao gót thời trang 👠 phù hợp nhiều phong cách.",

  product_jackets:
    "🧥 Chúng tôi có áo khoác giữ ấm mùa đông, áo gió nhẹ và áo mưa tiện lợi cho mọi thời tiết 🌧️❄️.",

  product_sets:
    "👗 Bạn đang tìm set đồ phối sẵn hợp phong cách? Shop có nhiều combo thời trang đẹp mắt, bạn muốn xem thử không? 😊",

  product_details:
    "🧵 Sản phẩm của chúng tôi làm từ chất liệu cao cấp như cotton, len, polyester... đảm bảo bền đẹp và an toàn.",

  product_size:
    "📏 Shop có đầy đủ size từ XS đến XXL và cả free size phù hợp với nhiều vóc dáng.",

  product_color:
    "🎨 Chúng tôi có đa dạng màu sắc từ tông cơ bản đến nổi bật. Bạn thích màu nào để mình giúp tìm nhé!",

  order_status:
    '📦 Bạn có thể kiểm tra trạng thái đơn hàng trong mục "Đơn hàng của tôi" hoặc cung cấp mã đơn hàng để mình hỗ trợ nhé.',

  cancel_order:
    "⏳ Bạn có thể hủy đơn hàng trong vòng 1 giờ sau khi đặt. Liên hệ hotline 📞 để được hỗ trợ nhanh nhất!",

  promo:
    "🎉 Levents thường xuyên có các chương trình ưu đãi hấp dẫn! Hãy theo dõi website hoặc đăng ký nhận tin để không bỏ lỡ nhé! 🛍️",

  returns_warranty:
    "♻️ Nếu sản phẩm bị lỗi kỹ thuật hoặc sai mẫu, bạn có thể đổi trả trong 7 ngày (kèm hóa đơn & sản phẩm nguyên vẹn).",

  thanks:
    "🙏 Rất vui được giúp bạn! Nếu còn thắc mắc gì, đừng ngần ngại hỏi nhé! 💬",

  unknown:
    "🤔 Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể hỏi lại hoặc nói rõ hơn được không?",

  recommend_products:
    "🌟 Dưới đây là một số sản phẩm nổi bật mà mình muốn giới thiệu cho bạn! Hy vọng bạn sẽ thích! 💖",

  bot_name:
    "Mình tên là KayBot – trợ lý ảo thân thiện của bạn 🤖. Rất vui được giúp đỡ!",

  chatbot_info:
    "🤖 Tôi là Kbot – trợ lý ảo của Levents, luôn sẵn sàng hỗ trợ bạn 24/7.\n📌 Có thể giúp bạn tìm sản phẩm, tra cứu đơn hàng, khuyến mãi và giải đáp thắc mắc.\n💬 Hãy nói cho tôi biết bạn cần gì nhé!",

  recommendLichLam: `Phong cách lịch lãm thường gắn liền với những chiếc sơ mi chỉn chu, quần dài đứng form và áo khoác sang trọng – tất cả đều tạo nên vẻ ngoài thanh lịch và chuyên nghiệp.
Dưới đây là một số sản phẩm mang phong cách lịch lãm bạn có thể tham khảo:`,

  recommendThoaiMai: `Sự thoải mái đến từ những chiếc áo thun mềm mại, quần short năng động và phụ kiện nhẹ nhàng – lý tưởng cho các hoạt động hàng ngày hoặc dạo phố.
Đây là các sản phẩm mang phong cách thoải mái, phù hợp cho những ngày năng động nhé!`,

  recommendNangDong: `Phong cách năng động thường đi cùng những chiếc áo thun trẻ trung, áo khoác thể thao và quần short linh hoạt – phù hợp cho người yêu thích sự di chuyển và năng lượng tích cực.
Dưới đây là gợi ý sản phẩm cho phong cách năng động, cá tính:`,

  recommendStreetStyle: `Street style là sự kết hợp ngẫu hứng nhưng cá tính giữa áo khoác, mũ, phụ kiện độc đáo và áo thun thời thượng – thể hiện cá tính riêng của bạn trong từng bước đi.
Bạn yêu thích street style? Đây là vài item hot bạn nên xem qua:`,

  recommendToiGian: `Phong cách tối giản chú trọng vào sự tinh tế và gọn gàng, với áo thun trơn, quần form cơ bản – dễ phối đồ, phù hợp với nhiều hoàn cảnh mà vẫn giữ vẻ thanh lịch.
Gợi ý phong cách tối giản – đơn giản nhưng tinh tế, dành riêng cho bạn:`,

  recommendCongSo: `Phong cách công sở đòi hỏi sự chỉn chu và chuyên nghiệp với áo sơ mi, quần tây và phụ kiện nhã nhặn – giúp bạn tạo ấn tượng tốt trong môi trường làm việc.
Phong cách công sở thanh lịch? Đây là gợi ý sản phẩm phù hợp:`,

  recommendHienDai: `Sự hiện đại thể hiện qua các item thời thượng như áo khoác, phụ kiện độc đáo, mũ cá tính và áo thun kiểu mới – mang lại vẻ ngoài trẻ trung, hợp xu hướng.
Phong cách hiện đại, bắt trend – bạn có thể thử các sản phẩm sau:`,
};

module.exports = responses;
