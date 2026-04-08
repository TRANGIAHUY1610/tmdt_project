const express = require("express");

const productsController = require("./products.controller");
const {
	idParamSchema,
	listProductsQuerySchema,
	searchProductsQuerySchema,
	createReviewSchema,
	createProductSchema,
	updateProductSchema,
	updateStockSchema,
} = require("./products.validators");
const asyncHandler = require("../../shared/asyncHandler");
const validate = require("../../middlewares/validate");
const { authenticate, authorize } = require("../../../middleware/auth");

const router = express.Router();

router.get("/flash-sale", asyncHandler((req, res) => productsController.getFlashSaleProducts(req, res)));
router.get("/", validate(listProductsQuerySchema, "query"), asyncHandler((req, res) => productsController.getAllProducts(req, res)));
router.get("/search", validate(searchProductsQuerySchema, "query"), asyncHandler((req, res) => productsController.searchProducts(req, res)));
router.get("/featured", asyncHandler((req, res) => productsController.getFeaturedProducts(req, res)));
router.get("/bestsellers", asyncHandler((req, res) => productsController.getBestsellers(req, res)));

router.get("/:id", validate(idParamSchema, "params"), asyncHandler((req, res) => productsController.getProductById(req, res)));
router.get("/:id/reviews", validate(idParamSchema, "params"), asyncHandler((req, res) => productsController.getProductReviews(req, res)));
router.post("/:id/reviews", authenticate, validate(idParamSchema, "params"), validate(createReviewSchema), asyncHandler((req, res) => productsController.createReview(req, res)));

router.post("/", authenticate, authorize(["admin"]), validate(createProductSchema), asyncHandler((req, res) => productsController.createProduct(req, res)));
router.put("/:id", authenticate, authorize(["admin"]), validate(idParamSchema, "params"), validate(updateProductSchema), asyncHandler((req, res) => productsController.updateProduct(req, res)));
router.delete("/:id", authenticate, authorize(["admin"]), validate(idParamSchema, "params"), asyncHandler((req, res) => productsController.deleteProduct(req, res)));
router.patch("/:id/stock", authenticate, authorize(["admin"]), validate(idParamSchema, "params"), validate(updateStockSchema), asyncHandler((req, res) => productsController.updateStock(req, res)));

module.exports = router;

