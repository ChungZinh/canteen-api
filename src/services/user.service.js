const { NotFoundResponse } = require("../core/error.response");
const User = require("../models/user.model");
const Food = require("../models/food.model");
const Order = require("../models/order.model");
class UserService {
  static async getStatistics() {
    const timeNow = new Date();

    // Xác định thời gian tháng hiện tại và tháng trước
    const startOfMonth = new Date(timeNow.getFullYear(), timeNow.getMonth(), 1);
    const endOfMonth = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() + 1,
      0
    );

    const startOfLastMonth = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth(),
      0
    );

    // Tính tổng số người dùng đã đăng ký trong tháng hiện tại
    const currentMonthUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }, // Lọc theo tháng hiện tại
        },
      },
      {
        $group: {
          _id: null, // Không nhóm theo bất kỳ trường nào
          totalUsers: { $sum: 1 }, // Tổng số người dùng đăng ký
        },
      },
    ]);

    // Tính tổng số người dùng đã đăng ký trong tháng trước
    const lastMonthUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, // Lọc theo tháng trước
        },
      },
      {
        $group: {
          _id: null, // Không nhóm theo bất kỳ trường nào
          totalUsers: { $sum: 1 }, // Tổng số người dùng đăng ký
        },
      },
    ]);

    // Tính tỷ lệ thay đổi phần trăm
    let percentageChange = 0;
    if (lastMonthUsers[0]?.totalUsers && currentMonthUsers[0]?.totalUsers) {
      percentageChange =
        ((currentMonthUsers[0].totalUsers - lastMonthUsers[0].totalUsers) /
          lastMonthUsers[0].totalUsers) *
        100;
    }

    res.status(200).json({
      currentMonthUsers: currentMonthUsers[0]?.totalUsers || 0, // Tổng số người dùng trong tháng hiện tại
      lastMonthUsers: lastMonthUsers[0]?.totalUsers || 0, // Tổng số người dùng trong tháng trước
      percentageChange: percentageChange.toFixed(2), // Phần trăm thay đổi
    });
  }

  static async getAllUsers(req) {
    const all = req.query.all;
    const page = parseInt(req.query.page) || 1;
    const limit = all === "true" ? parseInt(req.query.limit) : 8;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const users = await User.find({
      ...(req.query.searchTerm && {
        $or: [
          { name: { $regex: req.query.searchTerm, $options: "i" } },
          { description: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .populate("orders", "createdAt amount status")
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limit);

    const timeNow = new Date();

    const oneMonthAgo = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      timeNow.getDate()
    );

    const lastMonthTotalUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return {
      users,
      totalPages,
      totalUsers,
      lastMonthTotalUsers,
    };
  }

  static async getUserById(req, res) {
    const { id } = req.params;
    const all = req.query.all;
    const page = parseInt(req.query.page) || 1;
    const limit = all === "true" ? parseInt(req.query.limit) : 10;

    const user = await User.findById(id)
      .populate("orders", "createdAt amount status")
      .populate("wallet");

    const orders = await Order.find({ user: id })
      .populate("foods")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!user) {
      throw new NotFoundResponse("Không tìm thấy người dùng");
    }

    const totalOrders = await Order.countDocuments({ user: id });

    const totalPages = Math.ceil(totalOrders / limit);

    return {
      user,
      orders,
      totalPages,
    };
  }
}

module.exports = UserService;
