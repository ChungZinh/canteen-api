/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management
 */

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");
const MenuController = require("../controllers/menu.controller");

/**
 * @swagger
 * /api/v1/menu/{day}:
 *   get:
 *     summary: Get the food menu for a specific day
 *     tags: [Menu]
 *     description: Retrieve the food menu for a given day of the week.
 *     parameters:
 *       - name: day
 *         in: path
 *         required: true
 *         description: Day of the week
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *           example: Monday
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 menu:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: Monday
 *                     foods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f7a9d91c3f7b7a9d123456
 *                           name:
 *                             type: string
 *                             example: Spaghetti
 *                           price:
 *                             type: number
 *                             example: 10.99
 *       404:
 *         description: No menu found for the given day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Menu not found for the given day
 */
router.get("/:day", MenuController.getMenuForDay);


router.use(authentification);
/**
 * @swagger
 * /api/v1/menu:
 *   post:
 *     summary: Add or update the food menu for a specific day
 *     tags: [Menu]
 *     description: Add a list of food items to the menu for a specific day of the week.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - day
 *               - foodIds
 *             properties:
 *               day:
 *                 type: string
 *                 enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *                 example: Monday
 *               foodIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["64f7a9d91c3f7b7a9d123456", "64f7a9d91c3f7b7a9d789012"]
 *     responses:
 *       200:
 *         description: Menu successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 menu:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: Monday
 *                     foods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f7a9d91c3f7b7a9d123456
 *                           name:
 *                             type: string
 *                             example: Spaghetti
 *                           price:
 *                             type: number
 *                             example: 10.99
 *       404:
 *         description: No menu found for the given day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Menu not found for the given day
 */
router.post("/", MenuController.addMenuForDay);

module.exports = router;
