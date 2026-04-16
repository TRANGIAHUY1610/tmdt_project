const express = require("express");

const ordersController = require("./orders.controller");
const { createOrderSchema } = require("./orders.validators");
const asyncHandler = require("../../shared/asyncHandler");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../../middleware/auth");

const router = express.Router();

router.use((req, res, next) => {
  console.log(`[Order Router Debug] ${req.method} ${req.url}`);
  next();
});

router.post("/", authenticate, validate(createOrderSchema), asyncHandler((req, res) => ordersController.createOrder(req, res)));
router.get("/my-orders", authenticate, asyncHandler((req, res) => ordersController.getMyOrders(req, res)));
router.get("/:id", authenticate, asyncHandler((req, res) => ordersController.getOrderById(req, res)));
router.post("/:id/cancel", authenticate, asyncHandler((req, res) => ordersController.cancelOrder(req, res)));

module.exports = router;
