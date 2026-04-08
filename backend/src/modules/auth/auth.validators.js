const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  address: Joi.string().allow("", null).optional(),
  phone: Joi.string().trim().max(20).allow("", null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(1).required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  address: Joi.string().allow("", null).optional(),
  phone: Joi.string().trim().max(20).allow("", null).optional(),
  avatar_url: Joi.string().uri().allow("", null).optional(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
