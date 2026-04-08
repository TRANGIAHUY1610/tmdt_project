const Joi = require("joi");

const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().default(1),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().positive().required(),
});

const productIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  productIdParamSchema,
};

