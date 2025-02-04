const Joi = require("joi");

// Email
const emailSchema = Joi.string()
  .email({ minDomainSegments: 2 })
  .required()
  .messages({
    "string.email": "Email không hợp lệ.",
    "any.required": "Email là bắt buộc.",
  });

// Password
const passwordSchema = Joi.string().min(6).max(30).required().messages({
  "string.min": "Mật khẩu phải có ít nhất 6 ký tự.",
  "string.max": "Mật khẩu không được quá 30 ký tự.",
  "any.required": "Mật khẩu là bắt buộc.",
});

// Username
const usernameSchema = Joi.string().min(3).max(50).required().messages({
  "string.min": "Tên người dùng phải có ít nhất 3 ký tự.",
  "string.max": "Tên người dùng không được quá 50 ký tự.",
  "any.required": "Tên người dùng là bắt buộc.",
});

// Phone Number
const phoneNumberSchema = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .required()
  .messages({
    "string.pattern.base": "Số điện thoại phải là 10 chữ số.",
    "any.required": "Số điện thoại là bắt buộc.",
  });
