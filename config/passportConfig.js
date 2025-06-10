const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const { handleGoogleStrategy } = require("../services/authService");
const { handleFacebookStrategy } = require("../services/authService");
const User = require("../models/userModel");

// Khai báo chiến lược Google OAuth2
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    handleGoogleStrategy // Cung cấp hàm xác thực Google
  )
);

// Khai báo chiến lược Facebook OAuth2
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL:
        process.env.FACEBOOK_REDIRECT_URI || "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName", "photos"],
    },
    handleFacebookStrategy
  )
);

// Serialize và Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id); // Lưu ID của người dùng vào session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Tìm người dùng trong cơ sở dữ liệu
    done(null, user); // Trả về đối tượng người dùng
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
