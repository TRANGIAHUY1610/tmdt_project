const express = require("express");

const cartController = require("./cart.controller");
const {
	addToCartSchema,
	updateCartItemSchema,
	productIdParamSchema,
} = require("./cart.validators");
const asyncHandler = require("../../shared/asyncHandler");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler((req, res) => cartController.getCart(req, res)));
router.post("/add", validate(addToCartSchema), asyncHandler((req, res) => cartController.addToCart(req, res)));
router.put("/update/:productId", validate(productIdParamSchema, "params"), validate(updateCartItemSchema), asyncHandler((req, res) => cartController.updateCartItem(req, res)));
router.delete("/remove/:productId", validate(productIdParamSchema, "params"), asyncHandler((req, res) => cartController.removeFromCart(req, res)));
router.delete("/clear", asyncHandler((req, res) => cartController.clearCart(req, res)));

module.exports = router;

