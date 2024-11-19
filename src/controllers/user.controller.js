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
}


module.exports = UserController;