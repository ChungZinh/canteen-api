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
 * /foods:
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

router.use(authentification);


//pro: name, price, description, quantity, image, category

/**
 * @swagger
 * /foods:
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
 * /foods/{id}:
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
 * /foods/{id}:
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
 * /foods/sold-out/{id}:
 *   delete:
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
router.delete("/sold-out/:id", asyncHandler(FoodController.soldOutFood));

/**
 * @swagger
 * /foods/available/{id}:
 *   delete:
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
router.delete("/available/:id", asyncHandler(FoodController.availableFood));

/**
 * @swagger
 * /foods/{id}:
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
