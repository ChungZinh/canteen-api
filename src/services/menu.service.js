const { NotFoundResponse } = require("../core/error.response");
const Food = require("../models/food.model");
const Menu = require("../models/menu.model");
const mongoose = require("mongoose");

class MenuService {
  static async getMenuForDay(req) {
    const { day } = req.params;
    const { category, searchTerm } = req.query; // Lấy query categoryId từ request

    console.log("category", category);

    const menu = await Menu.findOne({ day }).populate({
      path: "foods",
      match: { isSoldOut: false },
      populate: {
        path: "category", // Populate category trực tiếp trong foods
      },
    });

    // Lấy danh sách foods từ menu
    let foods = menu ? menu.foods : [];

    // Lọc foods theo categoryId nếu query categoryId được cung cấp
    if (category) {
      foods = foods.filter(
        (food) => food.category?._id?.toString() === category
      ); // So sánh _id của category
    }

    // Lọc foods theo searchTerm nếu query searchTerm được cung cấp
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      foods = foods.filter((food) =>
        food.name.toLowerCase().includes(lowerCaseSearchTerm)
      ); // Tìm kiếm theo tên (case-insensitive)
    }

    console.log("foods", foods);

    return { menu, foods }; // Trả về cả menu và danh sách foods đã lọc
  }

  static async addMenuForDay(req) {
    const { day, foodIds } = req.body;

    // Kiểm tra các món ăn có tồn tại
    const foods = await Food.find({ _id: { $in: foodIds } });
    if (foods.length !== foodIds.length) {
      throw new NotFoundResponse("Không tìm thấy một số món ăn");
    }

    // Cập nhật hoặc tạo mới menu cho ngày
    let menu = await Menu.findOneAndUpdate(
      { day },
      { $set: { foods: foodIds } },
      { new: true, upsert: true }
    );

    // Lấy thông tin món ăn

    menu = await menu.populate("foods");

    return menu;
  }

  static async updateMenuForDay(req) {
    const { day, foodIds } = req.body;

    // Tìm và cập nhật menu theo ngày
    const updatedMenu = await Menu.findOneAndUpdate(
      { day },
      { foods: foodIds },
      { new: true, upsert: true } // upsert: true sẽ tạo mới nếu không tìm thấy
    ).populate("foods");

    if (!updatedMenu) {
      throw new NotFoundResponse("Không tìm thấy menu để cập nhật.");
    }

    return updatedMenu;
  }
}

module.exports = MenuService;
