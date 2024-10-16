const {
  CreatedResponse,
  SuccessResponse,
} = require("../core/success.response");
const FoodService = require("../services/food.service");
class FoodController {
  static async getAllFood(req, res, next) {
    new SuccessResponse({
      message: "Get all food successfully",
      data: await FoodService.getAllFood(req),
    }).send(res);
  }

  static async createFood(req, res, next) {
    new CreatedResponse({
      message: "Create food successfully",
      data: await FoodService.createFood(req),
    }).send(res);
  }

  static async deleteFood(req, res, next) {
    new CreatedResponse({
      message: "Delete food successfully",
      data: await FoodService.deleteFood(req),
    }).send(res);
  }

  static async updateFood(req, res, next) {
    new CreatedResponse({
      message: "Update food successfully",
      data: await FoodService.updateFood(req),
    }).send(res);
  }

  static async soldOutFood(req, res, next) {
    new CreatedResponse({
      message: "Sold out food successfully",
      data: await FoodService.soldOutFood(req),
    }).send(res);
  }

  static async availableFood(req, res, next) {
    new CreatedResponse({
      message: "Open food successfully",
      data: await FoodService.availableFood(req),
    }).send(res);
  }

  static async getFoodById(req, res, next) {
    new SuccessResponse({
      message: "Get food by id successfully",
      data: await FoodService.getFoodById(req),
    }).send(res);
  }
}

module.exports = FoodController;
