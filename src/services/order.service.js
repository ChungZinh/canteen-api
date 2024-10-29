const Order = require("../models/order.model");
const DetailFoodForOrder = require("../models/detailFoodForOrder.model");
const axios = require("axios");
const CryptoJS = require("crypto-js"); // Ensure CryptoJS is imported
const { createOrder } = require("./zalopay.service");
const Food = require("../models/food.model");
const config = {
  app_id: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  endpoint: process.env.ZALOPAY_ENDPOINT,
  callback_url:
    "https://e6a5-2402-800-637c-1454-fbca-b911-e729-834d.ngrok-free.app/api/v1/orders/zalopay-callback", // Replace with actual callback URL
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

  static async createOrder(req) {
    const { userId, foods, amount, paymentMethod, status, note } = req.body;
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

  static async zalopayCallback(req) {
    // Extract data from the request
    const dataStr = req.body.data;
    const reqMac = req.body.mac;

    // Tạo MAC để kiểm tra tính hợp lệ
    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

    const dataJson = await JSON.parse(dataStr);

    // Find the corresponding order
    const order = await Order.findOne({
      "payMethodResponse.trans_id": dataJson.app_trans_id,
    });

    if (!order) {
      console.error(`Order not found for transaction ID: ${dataJson.trans_id}`);
      return res.status(404).json({ error: "Order not found" });
    }

    if (reqMac !== mac) {
      order.status = "Đã hủy";
    } else {
      order.status = "Đã thanh toán";
      await order.updateOne({
        "payMethodResponse.zp_trans_id": dataJson.zp_trans_id.toString(),
      });
      // order.payMethodResponse.zp_trans_id = dataJson.zp_trans_id;

      // Parse `item` thành JSON để truy cập các sản phẩm
      const items = JSON.parse(dataJson.item);

      // Cập nhật stock của từng sản phẩm sau khi thanh toán thành công
      for (const item of items) {
        const product = await Food.findById(item._id); // `food` là ID sản phẩm trong DB

        if (!product) {
          console.error(`Product not found for ID: ${item._id}`);
          return res.status(404).json({ error: "Product not found" });
        }

        if (product) {
          product.stock -= item.quantity;
          await product.save();
          console.log(`Updated stock for ${product.name}: ${product.stock}`);
        }
      }
    }

    return await order.save();
  }
}

module.exports = OrderService;
