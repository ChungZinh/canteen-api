const Order = require("../models/order.model");
const DetailFoodForOrder = require("../models/detailFoodForOrder.model");
const axios = require("axios");
const CryptoJS = require("crypto-js"); // Ensure CryptoJS is imported
const { createOrder } = require("./zalopay.service");
const Food = require("../models/food.model");
const User = require("../models/user.model");
const { NotFoundResponse } = require("../core/error.response");
const config = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  callback_url:
    "https://c1eb-2405-4803-b4d4-6c30-de7f-5bb6-da5c-1f9f.ngrok-free.app/api/v1/orders/zalopay-callback", // Replace with actual callback URL
};
class OrderService {
  static async getAllOrders(req) {
    const all = req.query.all;
    const page = parseInt(req.query.page) || 1;
    const limit = all === "true" ? parseInt(req.query.limit) : 8;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const orders = await Order.find({
      ...(req.query.user && { user: req.query.user }),
      ...(req.query.status && { status: req.query.status }),
    })
      .populate("user", "fullName phone email avatar")
      .populate("foods", "name image price quantity")
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    const totalPages = Math.ceil(totalOrders / limit);

    const timeNow = new Date();

    const oneMonthAgo = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      timeNow.getDate()
    );

    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return {
      orders,
      totalOrders,
      totalPages,
      lastMonthOrders,
    };
  }

  static async getOrdersForChef(req) {
    const all = req.query.all;
    const page = parseInt(req.query.page) || 1;
    const limit = all === "true" ? parseInt(req.query.limit) : 8;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const orders = await Order.find({
      status: { $in: ["Đã thanh toán", "Đang chuẩn bị"] },
    })
      .populate("user", "fullName phone email avatar")
      .populate("foods", "name image price quantity")
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    const totalPages = Math.ceil(totalOrders / limit);

    return {
      orders,
      totalOrders,
      totalPages,
    };
  }
  static async getStatistics() {
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

    // Tính tổng số đơn hàng trong tháng hiện tại
    const currentMonthOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    console.log("currentMonthOrders", currentMonthOrders);

    // Tính tổng số đơn hàng trong tháng trước
    const lastMonthOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    console.log("lastMonthOrders", lastMonthOrders);

    // Tính tổng doanh thu trong tháng hiện tại
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: {
            $in: [
              "Đã thanh toán",
              "Đã hoàn tất",
              "Đã chuẩn bị",
              "Đang chuẩn bị",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    // Tính tổng doanh thu trong tháng trước
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: {
            $in: [
              "Đã thanh toán",
              "Đã hoàn tất",
              "Đã chuẩn bị",
              "Đang chuẩn bị",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    console.log("currentMonthRevenue", currentMonthRevenue);
    console.log("lastMonthRevenue", lastMonthRevenue);

    // Tính tổng số lượng món đã bán trong tháng hiện tại
    const currentMonthFoodSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: {
            $in: [
              "Đã thanh toán",
              "Đã hoàn tất",
              "Đã chuẩn bị",
              "Đang chuẩn bị",
            ],
          },
        },
      },
      { $unwind: "$foods" },
      {
        $group: {
          _id: null,
          totalFoodSales: { $sum: "$foods.quantity" },
        },
      },
    ]);

    // Tính tổng số lượng món đã bán trong tháng trước
    const lastMonthFoodSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: {
            $in: [
              "Đã thanh toán",
              "Đã hoàn tất",
              "Đã chuẩn bị",
              "Đang chuẩn bị",
            ],
          },
        },
      },
      { $unwind: "$foods" },
      {
        $group: {
          _id: null,
          totalFoodSales: { $sum: "$foods.quantity" },
        },
      },
    ]);

    console.log("currentMonthFoodSales", currentMonthFoodSales);
    console.log("lastMonthFoodSales", lastMonthFoodSales);

    // Tính tỷ lệ thay đổi phần trăm đơn hàng
    let percentageChangeOrder = 0;
    if (lastMonthOrders[0]?.totalOrders && currentMonthOrders[0]?.totalOrders) {
      percentageChangeOrder =
        ((currentMonthOrders[0].totalOrders - lastMonthOrders[0].totalOrders) /
          lastMonthOrders[0].totalOrders) *
        100;
    }

    // Tính tỷ lệ thay đổi phần trăm doanh thu
    let percentageChangeRevenue = 0;
    if (
      lastMonthRevenue[0]?.totalRevenue &&
      currentMonthRevenue[0]?.totalRevenue
    ) {
      percentageChangeRevenue =
        ((currentMonthRevenue[0].totalRevenue -
          lastMonthRevenue[0].totalRevenue) /
          lastMonthRevenue[0].totalRevenue) *
        100;
    }

    // Tính tỷ lệ thay đổi phần trăm số lượng món đã bán
    let percentageChangeFoodSales = 0;
    if (
      lastMonthFoodSales[0]?.totalFoodSales &&
      currentMonthFoodSales[0]?.totalFoodSales
    ) {
      percentageChangeFoodSales =
        ((currentMonthFoodSales[0].totalFoodSales -
          lastMonthFoodSales[0].totalFoodSales) /
          lastMonthFoodSales[0].totalFoodSales) *
        100;
    }

    return {
      currentMonthOrders: currentMonthOrders[0]?.totalOrders || 0,
      lastMonthOrders: lastMonthOrders[0]?.totalOrders || 0,
      percentageChangeOrder: percentageChangeOrder.toFixed(2),
      currentMonthRevenue: currentMonthRevenue[0]?.totalRevenue || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.totalRevenue || 0,
      percentageChangeRevenue: percentageChangeRevenue.toFixed(2),
      currentMonthFoodSales: currentMonthFoodSales[0]?.totalFoodSales || 0,
      lastMonthFoodSales: lastMonthFoodSales[0]?.totalFoodSales || 0,
      percentageChangeFoodSales: percentageChangeFoodSales.toFixed(2),
    };
  }

  static async createOrder(req) {
    const { userId, foods, amount, paymentMethod, status, note } = req.body;
    // Insert food details into the database
    console.log("foods", foods);
    const detailFoods = await foods.map((food) => {
      return {
        _id: food._id,
        name: food.name,
        quantity: food.quantity,
        price: food.price,
        total: food.quantity * food.price,
        image: food.image,
      };
    });

    // Process payment according to the method
    if (paymentMethod === "Momo") {
      // Implement Momo handling if needed
    } else if (paymentMethod === "ZaloPay") {
      // ZaloPay configuration

      // Create ZaloPay order
      const order = await createOrder(config, amount, detailFoods, userId);

      // Generate MAC for the order
      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      // Send request to ZaloPay API
      const response = await axios.post(config.endpoint, null, {
        params: order,
      });

      console.log("ZaloPay API Response:", response.data);

      if (response.data.return_code === 1) {
        // Save the new order to the database if successful
        let newOrder = new Order({
          user: userId,
          foods: detailFoods,
          note: note,
          amount,
          payMethod: paymentMethod,
          status: status || "Đã đặt",
          timeline: [
            {
              status: status || "Đã đặt",
              note: note,
            },
          ],
          payMethodResponse: {
            order_url: response.data.order_url,
            app_id: order.app_id,
            trans_id: order.app_trans_id,
            zp_trans_id: "",
          },
        });
        await newOrder.save();

        const user = await User.findById(userId);
        if (user) {
          user.orders.push(newOrder._id); // Thêm ID đơn hàng vào mảng đơn hàng của người dùng
          await user.save();
        } else {
          new NotFoundResponse("Người dùng không tồn tại");
        }

        return {
          newOrder,
          orderUrl: response.data.order_url,
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

  static async zalopayCallback(req) {
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    const dataJson = await JSON.parse(dataStr);

    const order = await Order.findOne({
      "payMethodResponse.trans_id": dataJson.app_trans_id,
    });

    if (!order) {
      console.error(`Order not found for transaction ID: ${dataJson.trans_id}`);
      return res.status(404).json({ error: "Order not found" });
    }

    if (reqMac !== mac) {
      order.status = "Đã hủy";
      order.timeline.push({
        status: "Đã hủy",
        note: "Xác thực thất bại, giao dịch bị hủy.",
      });
    } else {
      order.status = "Đã thanh toán";
      order.timeline.push({
        status: "Đã thanh toán",
        note: "Thanh toán thành công qua ZaloPay.",
      });
      await order.updateOne({
        "payMethodResponse.zp_trans_id": dataJson.zp_trans_id.toString(),
      });
      // order.payMethodResponse.zp_trans_id = dataJson.zp_trans_id;

      // Parse `item` thành JSON để truy cập các sản phẩm
      const items = JSON.parse(dataJson.item);

      // Cập nhật stock của từng sản phẩm sau khi thanh toán thành công
      let totalPoints = 0; // Biến để lưu điểm tích lũy
      for (const item of items) {
        const product = await Food.findById(item._id); // `food` là ID sản phẩm trong DB

        if (!product) {
          console.error(`Product not found for ID: ${item._id}`);
          return res.status(404).json({ error: "Product not found" });
        }

        if (product) {
          product.stock -= item.quantity;
          product.sales += item.quantity;
          await product.save();
          console.log(`Updated stock for ${product.name}: ${product.stock}`);

          // Tính điểm dựa trên số lượng sản phẩm hoặc giá trị của từng sản phẩm
          totalPoints += item.quantity * 10; // Ví dụ: mỗi sản phẩm mua thêm 10 điểm
        }
      }

      const user = await User.findById(order.user);
      if (user) {
        user.points += totalPoints; // Cộng điểm vào tài khoản người dùng
        user.orders.push(order._id); // Thêm ID đơn hàng vào mảng đơn hàng của người dùng
        await user.save();
        console.log(`Updated points for user ${user.name}: ${user.points}`);
      }
    }

    return await order.save();
  }

  static async deleteOrder(req) {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundResponse("Đơn hàng không tồn tại");
    }

    return await Order.findByIdAndDelete(orderId);
  }

  static async createOrderPos(req) {
    const { foods, amount, paymentMethod, status, note } = req.body;
    // Insert food details into the database
    console.log("foods", foods);
    const detailFoods = await foods.map((food) => {
      return {
        _id: food._id,
        quantity: food.quantity,
        price: food.price,
        total: food.quantity * food.price,
        image: food.image,
      };
    });

    // Process payment according to the method
    if (paymentMethod === "Momo") {
      // Implement Momo handling if needed
    } else if (paymentMethod === "ZaloPay") {
      // ZaloPay configuration

      const userId = `GUEST-${Math.floor(Math.random() * 1000000)}`;

      // Create ZaloPay order
      const order = await createOrder(config, amount, detailFoods, userId);

      console.log("order", order);

      // Generate MAC for the order
      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      // Send request to ZaloPay API
      const response = await axios.post(config.endpoint, null, {
        params: order,
      });

      console.log("ZaloPay API Response:", response.data);

      if (response.data.return_code === 1) {
        // Save the new order to the database if successful
        let newOrder = new Order({
          foods: detailFoods,
          note: note,
          amount,
          payMethod: paymentMethod,
          status: status || "Đã đặt",
          timeline: [
            {
              status: status || "Đã đặt",
              note: note,
            },
          ],
          payMethodResponse: {
            order_url: response.data.order_url,
            app_id: order.app_id,
            trans_id: order.app_trans_id,
            zp_trans_id: "",
          },
        });
        await newOrder.save();

        return {
          newOrder,
          orderUrl: response.data.order_url,
        };
      } else {
        // Handle error if order creation failed
        throw new Error(
          `Tạo đơn hàng thất bại: ${response.data.return_message}`
        );
      }
    } else {
      throw new Error("Phương thức thanh toán không hợp lệ");
    }
  }

  static async updateOrderStatus(req) {
    const orderId = req.params.id;
    const { status, note } = req.body;

    const order = await Order.findById(orderId).populate(
      "foods",
      "name image price quantity"
    );

    if (!order) {
      throw new NotFoundResponse("Đơn hàng không tồn tại");
    }

    order.status = status;
    order.timeline.push({
      status: status,
      note: note,
    });

    return await order.save();
  }
}

module.exports = OrderService;
