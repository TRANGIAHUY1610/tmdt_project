const Joi = require("joi");

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("pending", "confirmed", "shipped", "delivered", "cancelled").allow("", null).optional(),
});

const adminPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("active", "revoked", "").allow(null).default(""),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().allow("", null).max(2000).optional(),
  image_url: Joi.string().uri().allow("", null).optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "shipped", "delivered", "cancelled").required(),
  payment_status: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
  admin_note: Joi.string().allow("", null).max(2000).optional(),
});

const adminAccountSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().max(20).allow("", null).optional(),
  admin_code: Joi.string().trim().max(50).allow("", null).optional(),
  status: Joi.string().valid("active", "revoked").default("active"),
  granted_note: Joi.string().allow("", null).max(255).optional(),
});

const updateAdminStatusSchema = Joi.object({
  status: Joi.string().valid("active", "revoked").required(),
  granted_note: Joi.string().allow("", null).max(255).optional(),
});

module.exports = {
  paginationSchema,
  adminPaginationSchema,
  idParamSchema,
  categorySchema,
  updateOrderStatusSchema,
  adminAccountSchema,
  updateAdminStatusSchema,
};
