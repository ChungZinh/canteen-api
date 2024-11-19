const { NotFoundResponse } = require("../core/error.response");
const Category = require("../models/category.model");
const Food = require("../models/food.model");
class FoodService {
  static async createFood(req) {
    const { name, price, description, stock, image, category } = req.body;

    const categoryF = await Category.findById(category);

    if (!categoryF) {
      throw new Error("Category not found");
    }

    const food = new Food({
      name,
      slug: name.toLowerCase().replace(/ /g, "-"),
      price,
      description,
      stock,
      image,
      isSoldOut: stock === 0,
      category,
    });

    await food.save();

    return food;
  }

  static async getAllFood(req) {
    const all = req.query.all;
    const page = parseInt(req.query.page) || 1;
    const limit = all === "true" ? parseInt(req.query.limit) : 8;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const foods = await Food.find({
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.foodId && { _id: req.query.foodId }),
      ...(req.query.isSoldOut && { isSoldOut: req.query.isSoldOut }),
      ...(req.query.searchTerm && {
        $or: [
          { name: { $regex: req.query.searchTerm, $options: "i" } },
          { description: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .populate("category", "name")
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalFoods = await Food.countDocuments();

    const totalPages = Math.ceil(totalFoods / limit);

    const timeNow = new Date();

    const oneMonthAgo = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      timeNow.getDate()
    );

    const lastMonthFoods = await Food.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return {
      foods,
      totalPages,
      totalFoods,
      lastMonthFoods,
    };
  }

  // Hàm tính tổng số món đã bán trong tháng hiện tại và tháng trước, và so sánh tỷ lệ thay đổi
  static async getStatistics(req) {
    const timeNow = new Date();

    // Xác định thời gian tháng hiện tại và tháng trước
    const startOfMonth = new Date(timeNow.getFullYear(), timeNow.getMonth(), 1);
    const endOfMonth = timeNow; // Ngày hiện tại

    const startOfLastMonth = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      timeNow.getDate()
    );

    // Tính tổng số món đã bán trong tháng hiện tại
    const currentMonthSales = await Food.aggregate([
      {
        $match: {
          updatedAt: { $gte: startOfMonth, $lte: endOfMonth }, // Lọc theo tháng hiện tại
        },
      },
      {
        $group: {
          _id: null, // Không nhóm theo bất kỳ trường nào
          totalSales: { $sum: "$sales" }, // Tổng số món đã bán
        },
      },
    ]);

    // Tính tổng số món đã bán trong tháng trước
    const lastMonthSales = await Food.aggregate([
      {
        $match: {
          updatedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, // Lọc theo tháng trước
        },
      },
      {
        $group: {
          _id: null, // Không nhóm theo bất kỳ trường nào
          totalSales: { $sum: "$sales" }, // Tổng số món đã bán
        },
      },
    ]);

    const getAllSales = await Food.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$sales" },
        },
      },
    ]);


    // Tính tỷ lệ thay đổi phần trăm
    let percentageChange = 0;
    if (lastMonthSales[0]?.totalSales && currentMonthSales[0]?.totalSales) {
      percentageChange =
        ((currentMonthSales[0].totalSales - lastMonthSales[0].totalSales) /
          lastMonthSales[0].totalSales) *
        100;
    }


    return {
      currentMonthSales: currentMonthSales[0]?.totalSales || 0, // Tổng số món bán trong tháng hiện tại
      lastMonthSales: lastMonthSales[0]?.totalSales || 0, // Tổng số món bán trong tháng trước
      percentageChange: percentageChange.toFixed(2), // Phần trăm thay đổi
    };
  }

  static async deleteFood(req) {
    const { id } = req.params;

    const food = await Food.findById(id);

    if (!food) {
      throw new NotFoundResponse("Food not found");
    }

    food.isSoldOut = true;

    return await food.save();
  }

  static async updateFood(req) {
    const { id } = req.params;
    const { name, price, description, stock, image, category } = req.body;

    const categoryF = await Category.findById(category);

    if (!categoryF) {
      throw new NotFoundResponse("Category not found");
    }

    const food = await Food.findById(id);

    if (!food) {
      throw new NotFoundResponse("Food not found");
    }

    await Food.findByIdAndUpdate(id, {
      name,
      slug: name.toLowerCase().replace(/ /g, "-"),
      price,
      description,
      stock,
      image,
      category,
    });

    return await Food.findById(id);
  }

  static async soldOutFood(req) {
    console.log(req.params);

    const { id } = req.params;

    const food = await Food.findById(id);

    if (!food) {
      throw new NotFoundResponse("Food not found");
    }

    food.isSoldOut = true;

    return await food.save();
  }

  static async availableFood(req) {
    const { id } = req.params;

    const food = await Food.findById(id);

    if (!food) {
      throw new NotFoundResponse("Food not found");
    }

    food.isSoldOut = false;

    return await food.save();
  }

  static async getFoodById(req) {
    const { id } = req.params;

    const food = await Food.findById(id).populate("category", "name");

    if (!food) {
      throw new NotFoundResponse("Food not found");
    }

    return food;
  }

  static async getTop10SellingProducts() {
    return await Food.find()
      .sort({ sales: -1 })
      .limit(8)
      .populate("category", "name");
  }

  static async getFoodBySlug(slug) {
    return await Food.findOne.populate("category", "name").where({ slug });

    if (!food) {
      throw new NotFoundResponse("Food not found");
    }

    return food;
  }
}

module.exports = FoodService;
