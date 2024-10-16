const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user and admin authentication
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Admin successfully logged in
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", asyncHandler(AuthController.login));

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Admin registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Admin successfully registered
 *       400:
 *         description: Registration error
 */
router.post("/register", asyncHandler(AuthController.register));

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: 20119821
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       400:
 *         description: Invalid credentials
 */
router.post("/signin", asyncHandler(AuthController.signin));

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                  type: string
 *                  example: 20119821
 *              email:
 *                  type: string
 *                  example: user@example.com
 *              password:
 *                  type: string
 *                  example: password123
 *              rePassword:
 *                  type: string
 *                  example: password123
 *              fullName:
 *                  type: string
 *                  example: John Doe
 *              phone:
 *                  type: string
 *                  example: 0901234567
 *     responses:
 *       200:
 *         description: User successfully registered
 *       400:
 *         description: Registration error
 */
router.post("/signup", asyncHandler(AuthController.signup));

// Middleware to authenticate requests
router.use(authentification);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", asyncHandler(AuthController.logout));

module.exports = router;
