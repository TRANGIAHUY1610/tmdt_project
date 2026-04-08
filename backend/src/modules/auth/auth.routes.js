const express = require("express");

const authController = require("./auth.controller");
const {
	registerSchema,
	loginSchema,
	updateProfileSchema,
	changePasswordSchema,
} = require("./auth.validators");
const asyncHandler = require("../../shared/asyncHandler");
const validate = require("../../middlewares/validate");
const { authenticate } = require("../../../middleware/auth");

const router = express.Router();

router.post("/register", validate(registerSchema), asyncHandler((req, res) => authController.register(req, res)));
router.post("/login", validate(loginSchema), asyncHandler((req, res) => authController.login(req, res)));
router.get("/profile", authenticate, asyncHandler((req, res) => authController.getProfile(req, res)));
router.put("/profile", authenticate, validate(updateProfileSchema), asyncHandler((req, res) => authController.updateProfile(req, res)));
router.put("/change-password", authenticate, validate(changePasswordSchema), asyncHandler((req, res) => authController.changePassword(req, res)));

module.exports = router;
