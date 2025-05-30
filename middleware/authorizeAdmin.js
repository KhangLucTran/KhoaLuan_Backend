const authorizeAdmin = (req, res, next) => {
  const user = req.user;

  // Kiểm tra xem người dùng có phải là Admin không (giả sử role_code cho Admin là "R1-Admin")
  if (user.role_code && user.role_code.code === "R1") {
    console.log("Bạn là Admin");
    next(); // Nếu đúng là Admin, tiếp tục xử lý
  } else {
    return res.status(403).json({
      error: 1,
      message: "Access denied: Admin privileges required",
    });
  }
};

module.exports = authorizeAdmin;
