const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const CategoryController = require("../controllers/category.controller");
const { authentification } = require("../auth/authUtils");

router.get("/", asyncHandler(CategoryController.getAllCategories));

router.use(authentification);
router.post("/", asyncHandler(CategoryController.createCategory));
router.delete("/:id", asyncHandler(CategoryController.deleteCategory));
router.put("/:id", asyncHandler(CategoryController.updateCategory));
module.exports = router;
