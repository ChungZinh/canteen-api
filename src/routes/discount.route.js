/**
 * @swagger
 * tags:
 *   name: Discounts
 *   description: API for managing discounts
 */

const express = require("express");
const router = express.Router();
const DiscountController = require("../controllers/discount.controller");
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");


/**
 * @swagger
 * /discounts/use/{id}:
 *   put:
 *     summary: Use a discount by ID
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the discount to use
 *     responses:
 *       200:
 *         description: Discount used successfully
 *       404:
 *         description: Discount not found
 */
router.post("/use", asyncHandler(DiscountController.useDiscount));

router.use(authentification);

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: Get all discounts
 *     tags: [Discounts]
 *     responses:
 *       200:
 *         description: A list of discounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discount'
 */
router.get("/", asyncHandler(DiscountController.getDiscount));

/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Create a new discount
 *     tags: [Discounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Discount'
 *     responses:
 *       201:
 *         description: Discount created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Discount'
 */
router.post("/", asyncHandler(DiscountController.createDiscount));

/**
 * @swagger
 * /discounts/{id}:
 *   put:
 *     summary: Update a discount by ID
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the discount to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Discount'
 *     responses:
 *       200:
 *         description: Discount updated successfully
 *       404:
 *         description: Discount not found
 */
router.put("/:id", asyncHandler(DiscountController.updateDiscount));

/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     summary: Delete a discount by ID
 *     tags: [Discounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the discount to delete
 *     responses:
 *       200:
 *         description: Discount deleted successfully
 *       404:
 *         description: Discount not found
 */
router.delete("/:id", asyncHandler(DiscountController.deleteDiscount));



module.exports = router;
