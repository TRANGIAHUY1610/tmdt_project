const express = require("express");

const adminController = require("./admin.controller");
const validate = require("../../middlewares/validate");
const asyncHandler = require("../../shared/asyncHandler");
const { authenticate, authorize } = require("../../../middleware/auth");
const {
  paginationSchema,
  adminPaginationSchema,
  idParamSchema,
  categorySchema,
  updateOrderStatusSchema,
  adminAccountSchema,
  updateAdminStatusSchema,
} = require("./admin.validators");

const router = express.Router();

router.use(authenticate, authorize(["admin"]));

router.get("/dashboard", asyncHandler((req, res) => adminController.getDashboard(req, res)));

router.get("/admins", validate(adminPaginationSchema, "query"), asyncHandler((req, res) => adminController.listAdmins(req, res)));
router.post("/admins", validate(adminAccountSchema), asyncHandler((req, res) => adminController.createAdminAccount(req, res)));
router.patch("/admins/:id/status", validate(idParamSchema, "params"), validate(updateAdminStatusSchema), asyncHandler((req, res) => adminController.updateAdminStatus(req, res)));
router.delete("/admins/:id", validate(idParamSchema, "params"), asyncHandler((req, res) => adminController.deleteAdminAccount(req, res)));

router.get("/users", validate(paginationSchema, "query"), asyncHandler((req, res) => adminController.listUsers(req, res)));

router.get("/categories", asyncHandler((req, res) => adminController.listCategories(req, res)));
router.post("/categories", validate(categorySchema), asyncHandler((req, res) => adminController.createCategory(req, res)));
router.put("/categories/:id", validate(idParamSchema, "params"), validate(categorySchema), asyncHandler((req, res) => adminController.updateCategory(req, res)));
router.delete("/categories/:id", validate(idParamSchema, "params"), asyncHandler((req, res) => adminController.deleteCategory(req, res)));

router.get("/orders", validate(paginationSchema, "query"), asyncHandler((req, res) => adminController.listOrders(req, res)));
router.patch("/orders/:id/status", validate(idParamSchema, "params"), validate(updateOrderStatusSchema), asyncHandler((req, res) => adminController.updateOrderStatus(req, res)));

module.exports = router;
