const Joi = require("joi");

const createOrderSchema = Joi.object({
  shipping_address: Joi.string().trim().min(5).required(),
  payment_method: Joi.string()
    .valid("cod", "credit_card", "paypal", "bank_transfer")
    .required(),
  customer_note: Joi.string().allow("", null).optional(),
  shipping_fee: Joi.number().min(0).default(0),
  total_amount: Joi.number().positive().required(),
});

module.exports = {
  createOrderSchema,
};
