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
 * /api/v1/signin:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique ID of the user
 *                       example: 64a5f2e83b9d4c10ab9e6d33
 *                     email:
 *                       type: string
 *                       description: The user's email
 *                       example: user@example.com
 *                     fullName:
 *                       type: string
 *                       description: The user's full name
 *                       example: John Doe
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Internal server error
 */
router.post("/signin", asyncHandler(AuthController.signin));

/**
 * @swagger
 * /api/v1/signup:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - email
 *               - password
 *               - rePassword
 *               - fullName
 *               - phone
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: The student's unique ID
 *                 example: 20119821
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: password123
 *               rePassword:
 *                 type: string
 *                 description: Confirmation of the password
 *                 example: password123
 *               fullName:
 *                 type: string
 *                 description: The user's full name
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 description: The user's phone number
 *                 example: 0901234567
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique ID of the registered user
 *                   example: 64a5f2e83b9d4c10ab9e6d33
 *                 studentId:
 *                   type: string
 *                   description: The registered student's ID
 *                   example: 20119821
 *                 email:
 *                   type: string
 *                   description: The registered user's email
 *                   example: user@example.com
 *                 fullName:
 *                   type: string
 *                   description: The registered user's full name
 *                   example: John Doe
 *       400:
 *         description: Registration error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Registration failed. Please check your input.
 *       500:
 *         description: Internal server error
 */
router.post("/signup", asyncHandler(AuthController.signup));

// Middleware to authenticate requests
router.use(authentification);

/**
 * @swagger
 * /api/v1/logout:
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
