const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");
const UserController = require("../controllers/user.controller");
/**
 * @swagger
 * /api/user-registration-comparison:
 *   get:
 *     summary: Thống kê số lượng người dùng đã đăng ký trong tháng hiện tại và tháng trước
 *     description: Tính tổng số người dùng đã đăng ký trong tháng hiện tại và tháng trước và so sánh phần trăm thay đổi.
 *     responses:
 *       200:
 *         description: Thống kê số lượng người dùng đã đăng ký
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentMonthUsers:
 *                   type: number
 *                   description: Tổng số người dùng đã đăng ký trong tháng hiện tại.
 *                   example: 50
 *                 lastMonthUsers:
 *                   type: number
 *                   description: Tổng số người dùng đã đăng ký trong tháng trước.
 *                   example: 40
 *                 percentageChange:
 *                   type: string
 *                   description: Tỷ lệ thay đổi phần trăm giữa tháng hiện tại và tháng trước.
 *                   example: "25.00"
 *       500:
 *         description: Lỗi khi tính toán số lượng người dùng
 */

router.get("/statistics", asyncHandler(UserController.getStatistics));

/**
 * @swagger
 * /api/users:
 * get:
      summary: Get a list of users
      description: Retrieve a list of users with their details.
      tags:
        - Users
      responses:
        200:
          description: A list of users
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    _id:
                      type: string
                      example: 60f6d0a6e1d3e00008f1f86a
                    studentId:
                      type: string
                      example: "S123456"
                    fullName:
                      type: string
                      example: "John Doe"
                    isDeleted:
                      type: boolean
                      example: false
                    email:
                      type: string
                      format: email
                      example: "john.doe@example.com"
                    password:
                      type: string
                      example: "$2b$10$saltsaltsalt"
                    avatar:
                      type: string
                      example: "https://cdn.pixabay.com/photo/2016/08/31/11/54/icon-1633249_1280.png"
                    phone:
                      type: string
                      example: "+123456789"
                    address:
                      type: string
                      example: "123 Main St, Hometown"
                    wallet:
                      type: string
                      example: "60f6d0a6e1d3e00008f1f860"
                    points:
                      type: integer
                      example: 100
                    wishList:
                      type: array
                      items:
                        type: string
                        example: "60f6d0a6e1d3e00008f1f861"
                    orders:
                      type: array
                      items:
                        type: string
                        example: "60f6d0a6e1d3e00008f1f862"
                    role:
                      type: string
                      example: "60f6d0a6e1d3e00008f1f863"
                    createdAt:
                      type: string
                      format: date-time
                      example: "2023-06-30T12:34:56Z"
                    updatedAt:
                      type: string
                      format: date-time
                      example: "2023-07-01T08:21:34Z"
        500:
          description: Server error
*/

router.use(authentification);
router.get("/", asyncHandler(UserController.getAllUsers));

module.exports = router;
