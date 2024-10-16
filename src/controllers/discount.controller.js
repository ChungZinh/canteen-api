const {
  CreatedResponse,
  SuccessResponse,
} = require("../core/success.response");
const DiscountService = require("../services/discount.service");
class DiscountController {
  static async getDiscount(req, res, next) {
    // Get discount logic
    new SuccessResponse({
      message: "Discounts retrieved successfully",
      data: await DiscountService.getDiscount(),
    }).send(res);
  }

  static async createDiscount(req, res, next) {
    // Create discount logic
    new CreatedResponse({
      message: "Discount created successfully",
      data: await DiscountService.createDiscount(req),
    }).send(res);
  }

  static async updateDiscount(req, res, next) {
    // Update discount logic
  }

  static async deleteDiscount(req, res, next) {
    // Delete discount logic
  }
}

module.exports = DiscountController;
