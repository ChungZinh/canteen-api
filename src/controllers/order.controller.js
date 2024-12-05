const { NotFoundResponse } = require("../core/error.response");
const Order = require("../models/order.model");
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

  static async getOrderById(req, res, next) {
    new SuccessResponse({
      message: "Thông tin chi tiết đơn hàng",
      data: await OrderService.getOrderById(req),
    }).send(res);
  }

  static async getOrderForConfirmation(req, res, next) {
    try {
      const { id } = req.params;

      // Tìm đơn hàng bằng id
      const order = await Order.findById(id)
        .populate("foods", "name image price quantity")
        .populate("user", "fullName email phone");

      // Kiểm tra nếu không tìm thấy đơn hàng
      if (!order) {
        // Ném lỗi nếu không tìm thấy
        throw new NotFoundResponse("Đơn hàng không tồn tại");
      }
      return res.redirect(`http://localhost:5173/complete-order/${id}`);
    } catch (error) {
      next(error); // Chuyển lỗi đến middleware xử lý lỗi
    }
  }

  static async getOrdersForChef(req, res, next) {
    new SuccessResponse({
      message: "Danh sách đơn hàng cho đầu bếp",
      data: await OrderService.getOrdersForChef(req),
    }).send(res);
  }

  static async getWatlletByUser(req, res, next) {
    new SuccessResponse({
      message: "Thông tin User and Wallet",
      data: await OrderService.getWalletByUserId(req),
    }).send(res);
  }

  
  static async getOrderByUser(req, res, next) {
    new SuccessResponse({
      message: "Thông tin chi tiết đơn hàng",
      data: await OrderService.getOrderByUserId(req),
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

  static async createOrderMobile(req, res, next) {
    new CreatedResponse({
      message: "Đơn hàng đã được tạo thành công",
      data: await OrderService.createOrderMobile(req),
    }).send(res);
  }


  static async updateOrderStatus(req, res, next) {
    new SuccessResponse({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: await OrderService.updateOrderStatus(req),
    }).send(res);
  }

  static async completeOrder(req, res, next) {
    new SuccessResponse({
      message: "Hoàn tất đơn hàng thành công",
      data: await OrderService.completeOrder(req),
    }).send(res);
  }

  static async refundOrder(req, res, next) {
    new SuccessResponse({
      message: "Hoàn tiền đơn hàng thành công",
      data: await OrderService.refundOrder(req),
    }).send(res);
  }
}

module.exports = OrderController;
