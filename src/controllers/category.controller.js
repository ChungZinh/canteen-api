const { CreatedResponse } = require("../core/success.response");
const CategoryService = require("../services/category.service");

class CategoryController {
  static async createCategory(req, res, next) {
    new CreatedResponse({
      message: "Create category successfully",
      data: await CategoryService.createCategory(req),
    }).send(res);
  }

  static async getAllCategories(req, res, next) {
    new CreatedResponse({
      message: "Get all categories successfully",
      data: await CategoryService.getAllCategories(),
    }).send(res);
  }

  static async deleteCategory(req, res, next) {
    new CreatedResponse({
      message: "Delete category successfully",
      data: await CategoryService.deleteCategory(req),
    }).send(res);
  }

  static async updateCategory(req, res, next) {
    new CreatedResponse({
      message: "Update category successfully",
      data: await CategoryService.updateCategory(req),
    }).send(res);
  }
}

module.exports = CategoryController;
