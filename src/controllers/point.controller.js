const { SuccessResponse } = require("../core/success.response");
const PointService = require("../services/point.service");
class PointController {
  static async applyPoint(req, res, next) {
    new SuccessResponse({
      message: "Dùng điểm thành công",
      data: await PointService.applyPoint(req),
    }).send(res);
  }
}

module.exports = PointController;
