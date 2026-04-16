const express = require("express");

const ordersController = require("./orders.controller");
const { createOrderSchema } = require("./orders.validators");
const asyncHandler = require("../../shared/asyncHandler");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../../middleware/auth");

const router = express.Router();

// ===== USER =====
router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  asyncHandler((req, res) => ordersController.createOrder(req, res))
);

router.get(
  "/my-orders",
  authenticate,
  asyncHandler((req, res) => ordersController.getMyOrders(req, res))
);

// ===== ADMIN =====
router.get(
  "/",
  authenticate,
  asyncHandler((req, res) => ordersController.getAllOrders(req, res))
);

router.post(
  "/confirm",
  authenticate,
  asyncHandler((req, res) => ordersController.confirmOrder(req, res))
);

module.exports = router;
