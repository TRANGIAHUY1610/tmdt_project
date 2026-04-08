const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const productRoutes = require("../modules/products/products.routes");
const cartRoutes = require("../modules/cart/cart.routes");
const orderRoutes = require("../modules/orders/orders.routes");
const adminRoutes = require("../modules/admin/admin.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "GymStore API is running!",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);

module.exports = router;

