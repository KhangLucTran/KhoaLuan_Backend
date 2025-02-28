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

// App Config
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Cấu hình CORS
app.use(
  cors({
    origin: process.env.LOCAL_HOST,
    credentials: true,
  })
);

// ✅ Cấu hình session với MongoDB Store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // Lưu session trong 14 ngày
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
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ Kết nối MongoDB thành công!");

    app.listen(5000, () => {
      console.log("🚀 Server đang chạy trên cổng 5000");
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
    process.exit(1);
  });

// ✅ Ghi log chi tiết khi có request đến API
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Sử dụng các routes
app.use("/api", allRoutes);
