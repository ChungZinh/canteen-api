// routes/orderRoute.js
const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");
const OrderController = require("../controllers/order.controller");
/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - user
 *         - foods
 *         - amount
 *         - payMethod
 *         - status
 *       properties:
 *         user:
 *           type: string
 *           description: ID của người dùng
 *         foods:
 *           type: array
 *           items:
 *             type: string
 *           description: Mảng các ID sản phẩm
 *         amount:
 *           type: number
 *           description: Tổng giá trị đơn hàng
 *         payMethod:
 *           type: string
 *           enum: ["Momo", "ZaloPay", "Ví Sinh Viên"]
 *           description: Phương thức thanh toán
 *         status:
 *           type: string
 *           enum: ["Đã xác nhận", "Đang giao", "Đã giao"]
 *           description: Trạng thái đơn hàng
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Đơn hàng đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       500:
 *         description: Lỗi server
*/

router.post("/zalopay-callback", asyncHandler(OrderController.zalopayCallback));

router.use(authentification);
router.post("/", asyncHandler(OrderController.createOrder));


/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy tất cả đơn hàng
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Lỗi server
 */
router.get("/", asyncHandler(OrderController.getAllOrders));
module.exports = router;
