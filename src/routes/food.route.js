/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: API for managing food items
 */

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const FoodController = require("../controllers/food.controller");
const { authentification } = require("../auth/authUtils");

/**
 * @swagger
 * /api/v1/foods:
 *   get:
 *     summary: Get all food items
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of all food items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Food list retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     foods:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Food'
 *                     totalPages:
 *                       type: integer
 *                     totalFoods:
 *                       type: integer
 */
router.get("/", asyncHandler(FoodController.getAllFood));

/**
 * @swagger
 * /api/v1/foods/top-selling:
 *  get:
 *   summary: Get top 10 selling food items
 *  tags: [Foods]
 * responses:
 * 200:
 * description: Top 10 selling food items
 * content:
 * application/json:
 * schema:
    * type: object
    * properties:
        * success:
            * type: boolean
            * example: true
        * message:
            * type: string
            * example: Top 10 selling food items retrieved successfully
        * data:
 *
 */

router.get("/top-selling", asyncHandler(FoodController.getTop10SellingProducts));

/**
 * @swagger
 * /api/v1/foods/statistics:
 *   get:
 *     summary: Thống kê số lượng món đã bán trong tháng hiện tại và tháng trước
 *     description: Tính tổng số món đã bán trong tháng hiện tại và tháng trước và so sánh phần trăm thay đổi.
 *     responses:
 *       200:
 *         description: Thống kê doanh thu và số lượng món đã bán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentMonthSales:
 *                   type: number
 *                   description: Tổng số món đã bán trong tháng hiện tại.
 *                   example: 120
 *                 lastMonthSales:
 *                   type: number
 *                   description: Tổng số món đã bán trong tháng trước.
 *                   example: 100
 *                 percentageChange:
 *                   type: string
 *                   description: Tỷ lệ thay đổi phần trăm giữa tháng hiện tại và tháng trước.
 *                   example: "20.00"
 *       500:
 *         description: Lỗi khi tính toán doanh thu
 */
router.get("/statistics", asyncHandler(FoodController.getStatistics));
router.use(authentification);

//pro: name, price, description, quantity, image, category

/**
 * @swagger
 * /api/v1/foods:
 *   post:
 *     summary: Create a new food item
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Food'
 *     responses:
 *       201:
 *         description: Food created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Food created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 */
router.post("/", asyncHandler(FoodController.createFood));

/**
 * @swagger
 * /api/v1/foods/{id}:
 *   delete:
 *     summary: Delete a food item by ID
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         properties:
 *
 *     responses:
 *       200:
 *         description: Food deleted successfully
 *       404:
 *         description: Food not found
 */
router.delete("/:id", asyncHandler(FoodController.deleteFood));

/**
 * @swagger
 * /api/v1/foods/{id}:
 *   put:
 *     summary: Update a food item by ID
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the food to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Food'
 *     responses:
 *       200:
 *         description: Food updated successfully
 *       404:
 *         description: Food not found
 */
router.put("/:id", asyncHandler(FoodController.updateFood));

/**
 * @swagger
 * /api/v1/foods/sold-out/{id}:
 *   put:
 *     summary: Mark a food item as sold out
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the food to mark as sold out
 *     responses:
 *       200:
 *         description: Food marked as sold out
 *       404:
 *         description: Food not found
 */
router.put("/sold-out/:id", asyncHandler(FoodController.soldOutFood));

/**
 * @swagger
 * /api/v1/foods/available/{id}:
 *   put:
 *     summary: Mark a food item as available
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the food to mark as available
 *     responses:
 *       200:
 *         description: Food marked as available
 *       404:
 *         description: Food not found
 */
router.put("/available/:id", asyncHandler(FoodController.availableFood));

/**
 * @swagger
 * /api/v1/foods/{id}:
 *   get:
 *     summary: Get a food item by ID
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the food to retrieve
 *     responses:
 *       200:
 *         description: Food retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       404:
 *         description: Food not found
 */
router.get("/:id", asyncHandler(FoodController.getFoodById));

module.exports = router;
