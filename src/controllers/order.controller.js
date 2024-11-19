const {
  CreatedResponse,
  SuccessResponse,
} = require("../core/success.response");
const OrderService = require("../services/order.service");
class OrderController {
  static async getAllOrders(req, res, next) {
    new SuccessResponse({
      message: "Danh sách đơn hàng",
      data: await OrderService.getAllOrders(req),
    }).send(res);
  }

  static async getOrdersForChef(req, res, next) {
    new SuccessResponse({
      message: "Danh sách đơn hàng cho đầu bếp",
      data: await OrderService.getOrdersForChef(req),
    }).send(res);
  }

  static async getStatistics(req, res, next) {
    new SuccessResponse({
      message: "Thống kê số lượng đơn hàng",
      data: await OrderService.getStatistics(req),
    }).send(res);
  }

  static async createOrder(req, res, next) {
    new CreatedResponse({
      message: "Đơn hàng đã được tạo thành công",
      data: await OrderService.createOrder(req),
    }).send(res);
  }

  static async zalopayCallback(req, res, next) {
    new SuccessResponse({
      message: "ZaloPay callback received",
      data: await OrderService.zalopayCallback(req),
    }).send(res);
  }

  static async deleteOrder(req, res, next) {
    new SuccessResponse({
      message: "Đơn hàng đã được xóa thành công",
      data: await OrderService.deleteOrder(req),
    }).send(res);
  }

  static async createOrderPos(req, res, next) {
    new CreatedResponse({
      message: "Đơn hàng đã được tạo thành công",
      data: await OrderService.createOrderPos(req),
    }).send(res);
  }

  static async updateOrderStatus(req, res, next) {
    new SuccessResponse({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: await OrderService.updateOrderStatus(req),
    }).send(res);
  }
}

module.exports = OrderController;
