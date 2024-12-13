const Order = require("../models/order.model");
const DetailFoodForOrder = require("../models/detailFoodForOrder.model");
const axios = require("axios");
const CryptoJS = require("crypto-js"); // Ensure CryptoJS is imported
const { createOrder } = require("./zalopay.service");
const Food = require("../models/food.model");
const Wallet = require("../models/wallet.model");
const QRCode = require("qrcode");
const User = require("../models/user.model");
const mongoose = require('mongoose');
const {
  NotFoundResponse,
  UnauthorizedResponse,
  BadRequestResponse,
} = require("../core/error.response");
const { getIO } = require("../socket");
const { transporter } = require("../utils/sendMail");
const { generateOrderHTML } = require("../utils/generateOrderHTML");
const uploadFileToS3 = require("../utils/s3Upload");
const encodeOrderId = require("../utils/encode");
const moment = require("moment");
const config = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  callback_url: `${
    process.env.URL || "http://localhost:3001"
  }/api/v1/orders/zalopay-callback`, // Replace with actual callback URL
};
class OrderService {
  static async getAllOrders(req) {
    const all = req.query.all === "true";
    const page = parseInt(req.query.page) || 1;
    const limit = all ? parseInt(req.query.limit) || 0 : 8;
    const sortDirection = req.query.order === "asc" ? 1 : -1;


    const filters = {
      ...(req.query.id && { _id: req.query.id }),
      ...(req.query.user && { user: req.query.user }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.searchTerm && {
        $or: [
          { encodeOrderID: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };

    const orders = await Order.find(filters)
      .populate("user", "fullName phone email avatar")
      .populate("foods", "name image price quantity")
      .sort({ createdAt: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filters);
    const totalPages = limit > 0 ? Math.ceil(totalOrders / limit) : 1;

    const timeNow = new Date();
    const oneMonthAgo = new Date(
      timeNow.getFullYear(),
      timeNow.getMonth() - 1,
      timeNow.getDate()
    );

    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    // Map and encode order IDs asynchronously
    const encodedOrders = await Promise.all(
      orders.map(async (order) => {
        order.encodeOrderID = await encodeOrderId(order._id);
        return order;
      })

    );
    

    return {
      orders: encodedOrders,
      totalOrders,
      totalPages,
      lastMonthOrders,
    };
  }

  static async getOrderById(req) {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate("user", "fullName phone email avatar")
      .populate("foods", "name image price quantity");

    return order;
  }

  static async getOrderByUserId(req) {
    const userId = req.params.id.trim();  // Trim any extra spaces or newlines
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }
  
    const order = await Order.find({ user: new mongoose.Types.ObjectId(userId) })  // Use 'new' for ObjectId
      .populate("user", "fullName phone email avatar")
      .populate("foods", "name image price quantity");
  
    return order;
  }

  static async getWalletByUserId(req) {
    const userId = req.params.id;  
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }
      const UserWallet = await User.findById(userId).populate("wallet");
    return UserWallet;
  }

  static async getOrdersForChef(req) {
    const all = "true";
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
          status: {
            $in: ["Đã hoàn tất"],
          },
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
          status: {
            $in: ["Đã hoàn tất"],
          },
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
            $in: ["Đã hoàn tất"],
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
            $in: ["Đã hoàn tất"],
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
            $in: ["Đã hoàn tất"],
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
            $in: ["Đã hoàn tất"],
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

    // Tính tỷ lệ thay đổi phần trăm đơn hàng
    let percentageChangeOrder = 0;
    if (lastMonthOrders[0]?.totalOrders) {
      percentageChangeOrder =
        (((currentMonthOrders[0]?.totalOrders || 0) -
          lastMonthOrders[0].totalOrders) /
          lastMonthOrders[0].totalOrders) *
        100;
    }

    // Tính tỷ lệ thay đổi phần trăm doanh thu
    let percentageChangeRevenue = 0;
    if (lastMonthRevenue[0]?.totalRevenue) {
      percentageChangeRevenue =
        (((currentMonthRevenue[0]?.totalRevenue || 0) -
          lastMonthRevenue[0].totalRevenue) /
          lastMonthRevenue[0].totalRevenue) *
        100;
    }

    // Tính tỷ lệ thay đổi phần trăm số lượng món đã bán
    let percentageChangeFoodSales = 0;
    if (lastMonthFoodSales[0]?.totalFoodSales) {
      percentageChangeFoodSales =
        (((currentMonthFoodSales[0]?.totalFoodSales || 0) -
          lastMonthFoodSales[0].totalFoodSales) /
          lastMonthFoodSales[0].totalFoodSales) *
        100;
    }

    return {
      currentMonthOrders: currentMonthOrders[0]?.totalOrders || 0,
      lastMonthOrders: lastMonthOrders[0]?.totalOrders || 0,
      percentageChangeOrder: lastMonthOrders[0]?.totalOrders
        ? percentageChangeOrder.toFixed(2)
        : "N/A",
      currentMonthRevenue: currentMonthRevenue[0]?.totalRevenue || 0,
      lastMonthRevenue: lastMonthRevenue[0]?.totalRevenue || 0,
      percentageChangeRevenue: lastMonthRevenue[0]?.totalRevenue
        ? percentageChangeRevenue.toFixed(2)
        : "N/A",
      currentMonthFoodSales: currentMonthFoodSales[0]?.totalFoodSales || 0,
      lastMonthFoodSales: lastMonthFoodSales[0]?.totalFoodSales || 0,
      percentageChangeFoodSales: lastMonthFoodSales[0]?.totalFoodSales
        ? percentageChangeFoodSales.toFixed(2)
        : "N/A",
    };
  }

  
  static async createOrderMobile(req) {
    const {
      userId,
      foods,
      amount,
      status,
      note,
      customerInfo,
      point,
      paymentMethod,
    } = req.body;
  
    console.log("body", req.body);
  
    // Insert food details into the database
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
  
    if (paymentMethod === "Ví Sinh Viên") {
      // Handle wallet payment
      const user = await User.findById(userId).populate("wallet");
      if (!user) {
        throw new Error("User not found");
      }
  
      if (user.wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }
  
      // Deduct wallet balance  
      user.wallet.balance -= amount;
  
      // Accumulate points
      let totalPoints = detailFoods.reduce((sum, item) => sum + item.quantity * 15, 0);
      user.points += totalPoints;
  
      // Save wallet and user updates
      await user.wallet.save();
      await user.save();
  
      // Create order
      let newOrder = new Order({
        user: userId,
        customerInfo: customerInfo,
        foods: detailFoods,
        note: note,
        amount,
        payMethod: paymentMethod,
        status: "Đã thanh toán",
        timeline: [
          {
            status: "Đã thanh toán",
            note: "Thanh toán thành công qua ví điện tử.",
          },
        ],
        payMethodResponse: {},
      });
  
      await newOrder.save();
  
      user.orders.push(newOrder._id); // Add the order ID to the user's orders
      await user.save();
  
      console.log("newOrder", newOrder);
  
      return {
        newOrder,
        orderUrl: null,
      };
    } else if (paymentMethod === "ZaloPay") {
      // Handle ZaloPay payment
      const id = `GUEST-${Math.floor(Math.random() * 1000000)}`;
  
      const order = await createOrder(config, amount, detailFoods, userId || id);
      const data = `${config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
  
      const response = await axios.post(config.endpoint, null, {
        params: order,
      });
  
      console.log("ZaloPay API Response:", response.data);
  
      if (response.data.return_code === 1) {
        let newOrder = new Order({
          user: userId || null,
          customerInfo: customerInfo,
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
  
        newOrder.encodeOrderID = encodeOrderId(newOrder._id);
        await newOrder.save();
  
        const user = await User.findById(userId);
        if (user) {
          user.orders.push(newOrder._id);
          user.points -= point;
          await user.save();
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
    } else if (paymentMethod === "Momo") {
      // Handle Momo payment
      const momoOrder = await createMomoOrder(amount, detailFoods, userId);
      const momoResponse = await sendMomoRequest(momoOrder);
  
      if (momoResponse.success) {
        let newOrder = new Order({
          user: userId || null,
          customerInfo: customerInfo,
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
          payMethodResponse: momoResponse.data,
        });
  
        newOrder.encodeOrderID = encodeOrderId(newOrder._id);
        await newOrder.save();
  
        const user = await User.findById(userId);
        if (user) {
          user.orders.push(newOrder._id);
          user.points -= point;
          await user.save();
        }
        return {
          newOrder,
          orderUrl: momoResponse.data.orderUrl,
        };
      } else {
        throw new Error(
          `Tạo đơn hàng thất bại: ${momoResponse.errorMessage}`
        );
      }
    } else {
      // Handle other payment methods (default behavior)
      let newOrder = new Order({
        user: userId || null,
        customerInfo: customerInfo,
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
        payMethodResponse: {},
      });
  
      await newOrder.save();
  
      const user = await User.findById(userId);
      if (user) {
        user.orders.push(newOrder._id);
        user.points -= point;
        await user.save();
      }
  
      console.log("newOrder", newOrder);
  
      return {
        newOrder,
        orderUrl: response.data.order_url,
      };
    }
  }
  

  

  static async createOrder(req) {
    const {
      userId,
      foods,
      amount,
      paymentMethod,
      status,
      note,
      customerInfo,
      point,
    } = req.body;

    console.log("body", req.body);

    // Insert food details into the database
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

      const id = `GUEST-${Math.floor(Math.random() * 1000000)}`;

      // Create ZaloPay order
      const order = await createOrder(
        config,
        amount,
        detailFoods,
        userId || id
      );

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
          user: userId || null,
          customerInfo: customerInfo,
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

        newOrder.encodeOrderID = encodeOrderId(newOrder._id);

        await newOrder.save();

        const user = await User.findById(userId);
        if (user) {
          user.orders.push(newOrder._id); // Thêm ID đơn hàng vào mảng đơn hàng của người dùng
          user.points -= point; // Trừ điểm
          await user.save();
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
      // Vi Sinh vien
      let newOrder = new Order({
        user: userId,
        customerInfo: customerInfo,
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
      });
      // Cập nhật kho và doanh số sản phẩm
      let totalPoints = 0;
      const productUpdates = detailFoods.map(async (item) => {
        try {
          const product = await Food.findById(item._id);

          if (!product) {
            new NotFoundResponse("Sản phẩm không tồn tại");
          }

          product.stock -= item.quantity;
          product.sales += item.quantity;
          totalPoints += item.quantity * 15; // Tích lũy điểm
          await product.save();
        } catch (error) {
          console.error(`Error updating product ${item._id}:`, error);
        }
      });

      await Promise.all(productUpdates);

      const user = await User.findById(userId).populate("wallet");
      console.log("user", user);
      if (user) {
        user.orders.push(newOrder._id); // Thêm ID đơn hàng vào mảng đơn hàng của người dùng
        user.points -= point; // Trừ điểm
        user.wallet.balance -= amount;
        user.points += totalPoints;
        newOrder.status = "Đã thanh toán";
        newOrder.timeline.push({
          status: "Đã thanh toán",
          note: "Thanh toán thành công qua ví điện tử.",
        });
        await user.wallet.save();
        await user.save();
      }

      // Gửi sự kiện đến màn hình Chef qua WebSocket
      const io = getIO();
      io.emit("order_paid", newOrder); // Chỉ gửi object order, không bọc trong `{ order: ... }`

      // Gửi email xác nhận đơn hàng
      const url = `${
        process.env.URL || "http://localhost:3001"
      }/api/v1/orders/confirmation/${newOrder._id}`;

      const qrCode = await QRCode.toBuffer(url);

      const qrCodeUrl = await uploadFileToS3(
        "qr-codes",
        {
          name: `order-${newOrder._id}.png`,
          body: qrCode,
          type: "image/png",
        },
        {
          region: process.env.REGION,
          accessKeyId: process.env.ACCESS_KEY,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
          bucket: process.env.BUCKET,
        }
      );

      const generateOrderBill = generateOrderHTML(newOrder, qrCodeUrl);

      const mailOptions = {
        from: process.env.EMAIL,
        to: user?.email || newOrder.customerInfo.email,
        subject: `Đơn hàng và mã QR của đơn hàng #${newOrder._id}`,
        html: generateOrderBill,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(
          `Email sent to ${
            user?.email || newOrder.customerInfo.email
          } for order #${newOrder._id}`
        );
      } catch (error) {
        console.error("Error sending email:", error);
        return new Error("Gửi email thất bại");
      }

      newOrder.encodeOrderID = encodeOrderId(newOrder._id);

      return await newOrder.save();
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

    // Tìm đơn hàng dựa trên app_trans_id
    const order = await Order.findOne({
      "payMethodResponse.trans_id": dataJson.app_trans_id,
    })
      .populate("user")
      .populate("foods");

    if (!order) {
      console.error(
        `Order not found for transaction ID: ${dataJson.app_trans_id}`
      );
      return new NotFoundResponse("Đơn hàng không tồn tại");
    }

    // Kiểm tra MAC
    if (reqMac !== mac) {
      order.status = "Đã hủy";
      order.timeline.push({
        status: "Đã hủy",
        note: "Xác thực thất bại, giao dịch bị hủy.",
      });
      await order.save();
      return new UnauthorizedResponse("Xác thực không thành công");
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "Đã thanh toán";
    order.timeline.push({
      status: "Đã thanh toán",
      note: "Thanh toán thành công qua ZaloPay.",
    });

    // Gửi sự kiện đến màn hình Chef qua WebSocket
    const io = getIO();
    io.emit("order_paid", order); // Chỉ gửi object order, không bọc trong `{ order: ... }`

    // Cập nhật thông tin thanh toán
    order.payMethodResponse.zp_trans_id = dataJson.zp_trans_id.toString();
    await order.payMethodResponse.save();

    // Parse danh sách sản phẩm từ đơn hàng
    let items;
    try {
      items = JSON.parse(dataJson.item);
    } catch (error) {
      console.error("Error parsing items JSON:", error);
      return new BadRequestResponse("Danh sách sản phẩm không hợp lệ");
    }

    // Cập nhật kho và doanh số sản phẩm
    let totalPoints = 0;

    const productUpdates = items.map(async (item) => {
      try {
        const product = await Food.findById(item._id);

        if (!product) {
          console.error(`Product not found for ID: ${item._id}`);
          return; // Bỏ qua sản phẩm không tồn tại
        }

        product.stock -= item.quantity;
        product.sales += item.quantity;
        console.log("product", product.sales);
        totalPoints += item.quantity * 10; // Tích lũy điểm
        await product.save();
      } catch (error) {
        console.error(`Error updating product ${item._id}:`, error);
      }
    });

    await Promise.all(productUpdates);

    // Cập nhật điểm và đơn hàng của người dùng
    const user = await User.findById(order?.user);
    if (user) {
      user.points += totalPoints;
      user.orders.push(order._id);
      await user.save();
    }

    // Gửi email xác nhận đơn hàng
    const url = `${
      process.env.URL || "http://localhost:3001"
    }/api/v1/orders/confirmation/${order._id}`;

    const qrCode = await QRCode.toBuffer(url);

    const qrCodeUrl = await uploadFileToS3(
      "qr-codes",
      {
        name: `order-${order._id}.png`,
        body: qrCode,
        type: "image/png",
      },
      {
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        bucket: process.env.BUCKET,
      }
    );

    const generateOrderBill = generateOrderHTML(order, qrCodeUrl);

    const mailOptions = {
      from: process.env.EMAIL,
      to: user?.email || order.customerInfo.email,
      subject: `Đơn hàng và mã QR của đơn hàng #${order._id}`,
      html: generateOrderBill,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `Email sent to ${user?.email || order.customerInfo.email} for order #${
          order._id
        }`
      );
    } catch (error) {
      console.error("Error sending email:", error);
      return new Error("Gửi email thất bại");
    }
    // Lưu đơn hàng cuối cùng

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

  static async getOrderForConfirmation(req, res) {
    const { id } = req.params;

    // Tìm đơn hàng bằng id
    const order = await Order.findById(id)
      .populate("foods", "name image price quantity")
      .populate("user", "fullName email phone");

    // Kiểm tra nếu không tìm thấy đơn hàng
    if (!order) {
      // Ném lỗi nếu không tìm thấy
      throw new NotFoundResponse("Đơn hàng không tồn tại");
    }

    // Thực hiện chuyển hướng đến trang yêu cầu
    return res.redirect(`http://localhost:5173/contact`);
  }

  static async completeOrder(req) {
    const { id } = req.params;
    const { status } = req.body;

    console.log("status", status);
    console.log("id", id);

    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundResponse("Đơn hàng không tồn tại");
    }

    if (order.status === "Đã chuẩn bị") {
      order.status = "Đã hoàn tất";
      order.timeline.push({
        status: "Đã hoàn tất",
      });
    } else {
      throw new BadRequestResponse("Đơn hàng chưa chuẩn bị xong");
    }

    return await order.save();
  }

  static async refundOrder(req) {
    const { id, description } = req.body;
    console.log("id", id);
    const config = {
      app_id: process.env.ZALOPAY_APP_ID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      refund_url: "https://sb-openapi.zalopay.vn/v2/refund",
    };

    const order = await Order.findById(id);

    if (order.payMethod === "Ví Sinh Viên") {
      const user = await User.findById(order.user);
      user.wallet.balance += order.amount;
      await user.wallet.save();

      order.status = "Đã hủy";
      order.timeline.push({
        status: "Đã hủy",
        note: description,
      });

      return await order.save();
    } else if (order.payMethod === "ZaloPay") {
      const timestamp = Date.now();
      const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`; // unique id

      let params = {
        app_id: config.app_id,
        m_refund_id: `${moment().format("YYMMDD")}_${config.app_id}_${uid}`,
        timestamp, // miliseconds
        zp_trans_id: order.payMethodResponse?.zp_trans_id,
        amount: order.amount,
        description: description,
      };

      // Check required parameters
      console.log("Refund parameters:", params);

      // app_id|zp_trans_id|amount|description|timestamp
      let data =
        params.app_id +
        "|" +
        params.zp_trans_id +
        "|" +
        params.amount +
        "|" +
        params.description +
        "|" +
        params.timestamp;

      params.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

      axios
        .post(config.refund_url, null, { params })
        .then((res) => console.log(res.data))
        .catch((err) => console.log(err));
      // console.log("Response from ZaloPay:", response.data);

      if (response.data.return_code === 1) {
        // Cập nhật trạng thái đơn hàng
        order.status = "Đã hủy";
        order.timeline.push({
          status: "Đã hủy",
          note: description,
        });

        // Cập nhật kho và doanh số sản phẩm
        const productUpdates = order.foods.map(async (item) => {
          try {
            const product = await Food.findById(item._id);

            if (!product) {
              console.error(`Product not found for ID: ${item._id}`);
              return; // Bỏ qua sản phẩm không tồn tại
            }

            product.stock += item.quantity;
            product.sales -= item.quantity;
            await product.save();
          } catch (error) {
            console.error(`Error updating product ${item._id}:`, error);
          }
        });

        await Promise.all(productUpdates);

        // Cập nhật điểm và đơn hàng của người dùng
        const user = await User.findById(order.user);
        if (user) {
          user.points -= order.points;
          user.orders.push(order._id);
          await user.save();
        }

        return await order.save();
      } else {
        throw new BadRequestResponse("Hoàn tiền thất bại");
      }
    } else {
      throw new BadRequestResponse("Hoàn tiền thất bại");
    }
  }
}

module.exports = OrderService;
