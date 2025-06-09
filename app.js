const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const passport = require("./config/passportConfig");
const cors = require("cors");
const allRoutes = require("./routes/allRoutes");
const path = require("path");
require("dotenv").config();
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const onlineUsers = require("./config/onlineUser");

// ✅ Khởi tạo ứng dụng Express
const app = express();
const server = http.createServer(app);

// ✅ Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Cấu hình CORS
app.use(
  cors({
    origin: process.env.LOCAL_HOST || "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Cấu hình Session với MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // 14 ngày
    }),
    cookie: { secure: false, httpOnly: true },
  })
);

// ✅ Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công!");

    // 🚀 Chạy Server sau khi kết nối thành công
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server đang chạy trên cổng ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });

// ✅ Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.LOCAL_HOST || "http://localhost:3000", // Mặc định là localhost nếu chưa cấu hình
    credentials: true,
  },
});

// ✅ Xử lý kết nối Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 Người dùng đã kết nối:", socket.id);

  // Nhận userId từ client và lưu vào danh sách online
  socket.on("userOnline", (userId) => {
    if (userId) {
      onlineUsers.addUser(userId, socket.id);
      console.log(`✅ User ${userId} đã được đăng ký vào danh sách online.`);
    }
    console.log(onlineUsers);
  });

  socket.on("disconnect", () => {
    onlineUsers.removeUser(socket.id);
    console.log(`🔴 User với socket ID ${socket.id} đã ngắt kết nối.`);
  });
});

app.set("onlineUsers", onlineUsers);
app.set("io", io);

// ✅ Ghi log chi tiết khi có request đến API
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Sử dụng routes
app.use("/api", allRoutes);

// ✅ Xuất module
module.exports = { app, io, onlineUsers };
