const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes"); // Thêm authRoutes
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const addressRoutes = require("./routes/addressRoutes");
const provinceRoutes = require("./routes/provinceRoutes");
const productRoutes = require("./routes/productRoutes");
const districtRoutes = require("./routes/districtRoutes");
const lineitemRoutes = require("./routes/lineitemRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const cartRoutes = require("./routes/cartRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const commentRoutes = require("./routes/commentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const initializeRoles = require("./config/roleInit");
const cookieParser = require("cookie-parser");
const passport = require("./config/passportConfig");
const session = require("express-session");
const cors = require("cors");

// App Config
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Để parse URL-encoded data nếu cần

// Cấu hình middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Thêm địa chỉ frontend của bạn vào đây
    credentials: true,
  })
);

// MongoDB connection URL
const mongoDBURL =
  "mongodb+srv://khangluctran:sw91dM0z5LaffpYj@levents-test-pro.8kylh.mongodb.net/?retryWrites=true&w=majority&appName=levents-test-pro";

// Connect to MongoDB
mongoose
  .connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Kết nối MongoDB Cloud thành công!");
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối MongoDB:", err);
  });

// Sử dụng các routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/address/province", provinceRoutes);
app.use("/api/address/district", districtRoutes);
app.use("/api/product", productRoutes);
app.use("/api/lineitem", lineitemRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/comment", commentRoutes);
