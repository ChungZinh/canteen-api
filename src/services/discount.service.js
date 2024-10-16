const Food = require("../models/food.model");
const Discount = require("../models/discount.model");
const {
  NotFoundResponse,
  BadRequestResponse,
} = require("../core/error.response");
class DiscountService {
  static async getDiscount() {
    // Get discount logic

    return await Discount.find();
  }

  static async createDiscount(req) {
    // Create discount logic
    const {
      code,
      discountPercentage,
      startDate,
      endDate,
      minOrderValue,
      applicableProducts,
      description,
    } = req.body;

    // Kiểm tra các sản phẩm trong applicableProducts có tồn tại không
    const products = await Food.find({ _id: { $in: applicableProducts } });

    if (products.length !== applicableProducts.length) {
      throw new NotFoundResponse("Some products not found");
    }

    // Kiểm tra xem mã code đã tồn tại chưa
    const existingDiscount = await Discount.findOne({ code });

    if (existingDiscount) {
      throw new BadRequestResponse("Discount code already exists");
    }

    // Tạo discount
    const discount = new Discount({
      code,
      discountPercentage,
      startDate,
      endDate,
      minOrderValue,
      applicableProducts,
      description,
    });

    await discount.save();
  }
}

module.exports = DiscountService;
