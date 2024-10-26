const {
  CreatedResponse,
  SuccessResponse,
} = require("../core/success.response");
const DiscountService = require("../services/discount.service");
class DiscountController {
  static async getDiscount(req, res, next) {
    // Get discount logic
    new SuccessResponse({
      message: "Lấy được danh sách mã giảm giá thành công!",
      data: await DiscountService.getDiscount(),
    }).send(res);
  }

  static async createDiscount(req, res, next) {
    // Create discount logic
    new CreatedResponse({
      message: "Tạo mã giảm giá thành công!",
      data: await DiscountService.createDiscount(req),
    }).send(res);
  }

  static async updateDiscount(req, res, next) {
    // Update discount logic
    new SuccessResponse({
      message: "Cập nhật mã giảm giá thành công!",
      data: await DiscountService.updateDiscount(req),
    }).send(res);
  }

  static async deleteDiscount(req, res, next) {
    // Delete discount logic
    new SuccessResponse({
      message: "Xóa mã giảm giá thành công!",
      data: await DiscountService.deleteDiscount(req),
    }).send(res);
  }

  static async useDiscount(req, res, next) {
    // Use discount logic
    new SuccessResponse({
      message: "Sử dụng mã giảm giá thành công!",
      data: await DiscountService.useDiscount(req),
    }).send(res);
  }
}

module.exports = DiscountController;
