const {
  NotFoundResponse,
  BadRequestResponse,
} = require("../core/error.response");
const User = require("../models/user.model");
const Food = require("../models/food.model");
const Order = require("../models/order.model");
const ZaloService = require("../services/zalopay.service");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const Transaction = require("../models/transaction.model");
const Wallet = require("../models/wallet.model");
const config = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  callback_url: `${
    process.env.URL || "http://localhost:3001"
  }/api/v1/users/zalopay-callback`, // Replace with actual callback URL
};
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
    const limit = all === "true" ? parseInt(req.query.limit) : 5;

    const user = await User.findById(id)
      .populate("orders", "createdAt amount status")
      .populate("wallet");

    const ordersCompleted = await Order.find({
      user: id,
      status: { $in: ["Đã hoàn tất", "Đã hủy"] },
    })
      .populate("foods")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const ordersInProgress = await Order.find({
      user: id,
      status: { $nin: ["Đã hoàn tất", "Đã hủy"] },
    })
      .populate("foods")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!user) {
      throw new NotFoundResponse("Không tìm thấy người dùng");
    }

    const totalOrdersCompleted = await Order.countDocuments({
      user: id,
      status: { $in: ["Đã hoàn tất", "Đã hủy"] },
    });

    const totalPages = Math.ceil(totalOrdersCompleted / limit);

    return {
      user,
      ordersCompleted,
      ordersInProgress,
      totalPages,
    };
  }

  static async depositMoney(req, res) {
    const { amount, userId, paymentMethod } = req.body;

    // Process payment according to the method
    if (paymentMethod === "Momo") {
      // Implement Momo handling if needed
    } else if (paymentMethod === "ZaloPay") {
      // ZaloPay configuration

      // Create ZaloPay order
      const order = await ZaloService.depositMoney(config, amount, userId);

      console.log("ZaloPay Order:", order);

      // Generate MAC for the order
      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      // Send request to ZaloPay API
      const response = await axios.post(config.endpoint, null, {
        params: order,
      });

      console.log("ZaloPay API Response:", response.data);

      if (response.data.return_code === 1) {
        const wallet = await Wallet.findOne({ user: userId });

        if (!wallet) {
          throw new NotFoundResponse("Ví không tồn tại");
        }

        const trans = await Transaction.create({
          user: userId,
          amount,
          transactionType: "deposit",
          status: "Dang xu ly",
        });

        wallet.transactions = trans._id;

        await wallet.save();

        return {
          paymentUrl: response.data.order_url,
        };
      } else {
        throw new Error(
          `Tạo đơn hàng thất bại: ${response.data.return_message}`
        );
      }
    } else {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }
  }

  static async zalopayCallback(req, res) {
    const { data: dataStr, mac: reqMac } = req.body;

    // Tính toán MAC để xác thực
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    // Parse dữ liệu JSON từ request
    let dataJson;
    try {
      dataJson = JSON.parse(dataStr);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return new BadRequestResponse("Dữ liệu không hợp lệ");
    }

    //tim wallet
    const wallet = await Wallet.findOne({ user: dataJson.app_user });

    if (!wallet) {
      throw new NotFoundResponse("Ví không tồn tại");
    }

    // Kiểm tra MAC
    if (reqMac !== mac) {
      console.error("MAC không khớp");
      return new BadRequestResponse("MAC không khớp");
    }
  }
}

module.exports = UserService;
