const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");

//admin
router.post("/login", asyncHandler(AuthController.login));
router.post("/register", asyncHandler(AuthController.register));

//user
router.post("/signin", asyncHandler(AuthController.signin));
router.post("/signup", asyncHandler(AuthController.signup));
router.use(authentification);
router.post("/logout", asyncHandler(AuthController.logout));

module.exports = router;
