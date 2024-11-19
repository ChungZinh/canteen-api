const cron = require("node-cron");
const Order = require("../models/order.model");

// Tạo cron job để kiểm tra mỗi phút
cron.schedule("* * * * *", async () => {
  try {
    // Lấy các đơn hàng có trạng thái "Đã đặt" và thời gian tạo đã qua 5 phút
    const ordersToCancel = await Order.find({
      status: "Đã đặt",
      createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) }, // Kiểm tra các đơn hàng đã hơn 5 phút
    });

    console.log(`Found ${ordersToCancel.length} orders to cancel`);

    if (ordersToCancel.length > 0) {
      // Cập nhật các đơn hàng này thành "Đã hủy"
      for (const order of ordersToCancel) {
        // Thêm một dòng mới vào timeline để ghi lại trạng thái "Đã hủy"
        order.timeline.push({
          status: "Đã hủy",
          timestamp: new Date(),
          note: "Đơn hàng tự động hủy do không thanh toán trong 5 phút",
        });

        // Cập nhật trạng thái của đơn hàng thành "Đã hủy"
        order.status = "Đã hủy";

        // Lưu lại đơn hàng đã cập nhật
        await order.save();
        console.log(`Order ${order._id} đã được hủy tự động`);
      }
    }
  } catch (error) {
    console.error("Error while canceling orders:", error);
  }
});

