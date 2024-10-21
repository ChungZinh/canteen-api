const { NotFoundResponse } = require("../core/error.response");
const Category = require("../models/category.model");
const Food = require("../models/food.model");
class FoodService {
  static async createFood(req) {
    const { name, price, description, quantity, image, category } = req.body;

    const categoryF = await Category.findById(category);

    if (!categoryF) {
      throw new Error("Category not found");
    }

    const food = new Food({
      name,
      slug: name.toLowerCase().replace(/ /g, "-"),
      price,
      description,
      quantity,
      image,
      isSoldOut: quantity === 0,
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
    const { name, price, description, quantity, image, category } = req.body;

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
      quantity,
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
