const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.number().integer().positive().optional(),
  min_price: Joi.number().min(0).optional(),
  max_price: Joi.number().min(0).optional(),
  search: Joi.string().trim().allow("", null).optional(),
  sort_by: Joi.string().valid("price", "id").optional(),
  sort_order: Joi.string().valid("asc", "desc").optional(),
});

const searchProductsQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
});

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow("", null).required(),
});

const createProductSchema = Joi.object({
  title: Joi.string().trim().min(1).required(),
  author: Joi.string().trim().min(1).required(),
  price: Joi.number().positive().required(),
  category_id: Joi.number().integer().positive().required(),
  description: Joi.string().allow("", null).optional(),
  image_url: Joi.string().allow("", null).optional(),
  stock_quantity: Joi.number().integer().min(0).default(0),
});

const updateProductSchema = Joi.object({
  title: Joi.string().trim().min(1).optional(),
  author: Joi.string().trim().min(1).optional(),
  price: Joi.number().positive().optional(),
  category_id: Joi.number().integer().positive().optional(),
  description: Joi.string().allow("", null).optional(),
  image_url: Joi.string().allow("", null).optional(),
  stock_quantity: Joi.number().integer().min(0).optional(),
}).min(1);

const updateStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required(),
});

module.exports = {
  idParamSchema,
  listProductsQuerySchema,
  searchProductsQuerySchema,
  createReviewSchema,
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
};

