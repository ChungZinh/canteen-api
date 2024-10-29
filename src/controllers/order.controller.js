const { CreatedResponse } = require("../core/success.response");
const OrderService = require("../services/order.service");
class OrderController {
  static async getAllOrders(req, res, next) {
    new CreatedResponse({
      message: "Danh sách đơn hàng",
      data: await OrderService.getAllOrders(req),
    }).send(res);
  }

  static async createOrder(req, res, next) {
    new CreatedResponse({
      message: "Đơn hàng đã được tạo thành công",
      data: await OrderService.createOrder(req),
    }).send(res);
  }

  static async zalopayCallback(req, res, next) {
    new CreatedResponse({
      message: "ZaloPay callback received",
      data: await OrderService.zalopayCallback(req),
    }).send(res);
  }
}

module.exports = OrderController;
