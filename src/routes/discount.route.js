const express = require("express");
const router = express.Router();
const DiscountController = require("../controllers/discount.controller");
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");

router.use(authentification);
router.get("/", asyncHandler(DiscountController.getDiscount));
router.post("/", asyncHandler(DiscountController.createDiscount));
router.put("/:id", asyncHandler(DiscountController.updateDiscount));
router.delete("/:id", asyncHandler(DiscountController.deleteDiscount));

module.exports = router;
