const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const FoodController = require("../controllers/food.controller");
const { authentification } = require("../auth/authUtils");


router.get("/", asyncHandler(FoodController.getAllFood));

router.use(authentification);
router.post("/", asyncHandler(FoodController.createFood));
router.delete("/:id", asyncHandler(FoodController.deleteFood));
router.put("/:id", asyncHandler(FoodController.updateFood));
//sold out
router.delete("/sold-out/:id", asyncHandler(FoodController.soldOutFood));
// open
router.delete("/available/:id", asyncHandler(FoodController.availableFood));
module.exports = router;
