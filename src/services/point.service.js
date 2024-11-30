const { NotFoundResponse } = require("../core/error.response");
const User = require("../models/user.model");

class PointService {
  static async applyPoint(req) {
    const { userId, point } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundResponse("Người dùng không tồn tại");
    }

    if (user.points < point) {
      throw new NotFoundResponse("Số điểm không đủ");
    }

    let discount = 0;

    user.points -= point;

    // 100 = 10000 VND

    discount = point * 100;

    await user.save();
    
    return discount;
  }
}

module.exports = PointService;
