const Category = require("../models/category.model");
class CategoryService {
  static async createCategory(req) {
    const { name, description, image } = req.body;

    // Create category
    const category = new Category({
      name,
      description,
      image,
    });

    // Save category
    return await category.save();
  }

  static async getAllCategories() {
    // Find all categories
    return await Category.find();
  }

  static async deleteCategory(req) {
    const { id } = req.params;

    // Find category by id
    const category = await Category.findById(id);

    // Check if category exists
    if (!category) {
      throw new Error("Category not found");
    }

    return await Category.findByIdAndDelete(id);
  }

  static async updateCategory(req) {
    const { id } = req.params;
    const { name, description, image } = req.body;

    // Find category by id
    const category = await Category.findById(id);

    // Check if category exists
    if (!category) {
      throw new Error("Category not found");
    }

    // Update category
    await Category.findByIdAndUpdate(id, {
      name,
      description,
      image,
    });

    // Find category by id
    return await Category.findById(id);
  }
}

module.exports = CategoryService;
