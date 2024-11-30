const { SuccessResponse } = require("../core/success.response");
const UserService = require("../services/user.service");
class UserController {
  static async getStatistics(req, res, next) {
    new SuccessResponse({
      message: "Thống kê số lượng người dùng đã đăng ký",
      data: await UserService.getStatistics(),
    }).send(res);
  }

  static async getAllUsers(req, res, next) {
    new SuccessResponse({
      message: "Danh sách người dùng",
      data: await UserService.getAllUsers(req),
    }).send(res);
  }

  static async getUserById(req, res, next) {
    new SuccessResponse({
      message: "Thông tin người dùng",
      data: await UserService.getUserById(req, res),
    }).send(res);
  }

  static async deposit(req, res, next) {
    new SuccessResponse({
      message: "Nạp tiền vào ví",
      data: await UserService.depositMoney(req, res),
    }).send(res);
  }

  static async zalopayCallback(req, res, next) {
    new SuccessResponse({
      message: "Zalo callback",
      data: await UserService.zalopayCallback(req, res),
    }).send(res);
  }
}

module.exports = UserController;
