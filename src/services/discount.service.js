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

  static async updateDiscount(req) {
    // Update discount logic
    const { id } = req.params;
    const {
      code,
      discountPercentage,
      startDate,
      endDate,
      minOrderValue,
      applicableProducts,
      description,
    } = req.body;

    const discount = await Discount.findById(id);

    if (!discount) {
      throw new NotFoundResponse("Discount not found");
    }

    // Kiểm tra các sản phẩm trong applicableProducts có tồn tại không

    const products = await Food.find({ _id: { $in: applicableProducts } });

    if (products.length !== applicableProducts.length) {
      throw new NotFoundResponse("Some products not found");
    }

    await Discount.findByIdAndUpdate(id, {
      code,
      discountPercentage,
      startDate,
      endDate,
      minOrderValue,
      applicableProducts,
      description,
    });

    return discount;
  }

  static async deleteDiscount(req) {
    // Delete discount logic
    const { id } = req.params;

    const discount = await Discount.findById(id);

    if (!discount) {
      throw new NotFoundResponse("Discount not found");
    }

    await Discount.findByIdAndDelete(id);

    return discount;
  }

  static async useDiscount(req) {
    const { code, cartItems } = req.body;

    // Tìm mã giảm giá theo code
    const discount = await Discount.findOne({ code, active: true });

    if (!discount) {
      throw new NotFoundResponse(
        "Mã giảm giá không tồn tại hoặc không còn hoạt động"
      );
    }

    const currentDate = new Date();

    // Kiểm tra xem mã giảm giá có nằm trong thời gian hiệu lực không
    if (currentDate < discount.startDate || currentDate > discount.endDate) {
      throw new NotFoundResponse("Mã giảm giá không còn hiệu lực");
    }

    // Khởi tạo các biến để lưu giá trị tổng đơn hàng và tổng giảm giá
    let totalOrderValue = 0;
    let discountAmount = 0;

    // Duyệt qua từng sản phẩm trong giỏ hàng
    cartItems.forEach((item) => {
      totalOrderValue += item.price * item.quantity;

      // Nếu mã giảm giá có áp dụng cho sản phẩm cụ thể, kiểm tra sản phẩm đó
      if (
        discount.applicableProducts.length === 0 ||
        discount.applicableProducts.includes(item._id)
      ) {
        // Tính giảm giá cho sản phẩm này
        discountAmount +=
          (item.price * item.quantity * discount.discountPercentage) / 100;

        console.log(
          (item.price * item.quantity * discount.discountPercentage) / 100
        );
      } else {
        throw new NotFoundResponse(
          "Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng"
        );
      }
    });

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (totalOrderValue < discount.minOrderValue) {
      throw new ErrorResponse(
        "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá"
      );
    }

    console.log("discountAmount", discountAmount);

    // Trả về giá trị giảm giá
    return {
      discountAmount,
      finalTotal: totalOrderValue - discountAmount,
    };
  }
}

module.exports = DiscountService;
