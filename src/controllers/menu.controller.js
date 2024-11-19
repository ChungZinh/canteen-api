const {
  SuccessResponse,
  CreatedResponse,
} = require("../core/success.response");
const MenuService = require("../services/menu.service");
class MenuController {
  static async getMenuForDay(req, res, next) {
    new SuccessResponse({
      message: "Menu retrieved successfully",
      data: await MenuService.getMenuForDay(req),
    }).send(res);
  }

  static async addMenuForDay(req, res, next) {
    new CreatedResponse({
      message: "Menu added successfully",
      data: await MenuService.addMenuForDay(req),
    }).send(res);
  }
}

module.exports = MenuController;
