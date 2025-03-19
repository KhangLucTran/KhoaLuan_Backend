const express = require("express");

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const profileRoutes = require("./profileRoutes");
const addressRoutes = require("./addressRoutes");
const productRoutes = require("./productRoutes");
const lineitemRoutes = require("./lineitemRoutes");
const cartRoutes = require("./cartRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const favoriteRoutes = require("./favoriteRoutes");
const commentRoutes = require("./commentRoutes");
const discountRoutes = require("./discountRoutes");
const paymentRoutes = require("./paymentRoutes");
const recommandRoutes = require("./recommandRoutes");
const notificationRoutes = require("./notificationRoutes");
const searchHistoryRoutes = require("./searchHistoryRoutes");
const router = express.Router();

// Định nghĩa tất cả các route
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/profile", profileRoutes);
router.use("/address", addressRoutes);
router.use("/product", productRoutes);
router.use("/lineitem", lineitemRoutes);
router.use("/cart", cartRoutes);
router.use("/invoice", invoiceRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/comment", commentRoutes);
router.use("/discount", discountRoutes);
router.use("/payment", paymentRoutes);
router.use("/notification", notificationRoutes);
router.use("/recommendations", recommandRoutes);
router.use("/search", searchHistoryRoutes);

module.exports = router;
