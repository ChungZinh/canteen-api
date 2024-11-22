const generateOrderHTML = (orderDetails, qrCode) => {

  // Generate product rows dynamically from order details
  const productRows =
    orderDetails?.foods
      ?.map(
        (item) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item?.name || ""}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${
        item?.quantity || 0
      }</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${(
        item?.price || 0
      ).toLocaleString()}₫</td>
    </tr>`
      )
      .join("") ||
    "<tr><td colspan='3' style='text-align:center;'>No products found</td></tr>";

  // Generate the final HTML template
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h1 style="text-align: center; color: #333;">Cảm ơn bạn đã đặt hàng, ${
      orderDetails?.user?.fullName || "Khách hàng"
    }!</h1>
    <p style="text-align: center; color: #333;">Đơn hàng của bạn ${
      orderDetails._id || "N/A"
    } đã được xác nhận và đang được chuẩn bị.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f4f4f4;">
          <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
    </table>

    <p style="font-size: 16px; font-weight: bold; text-align: right;">Tổng tiền: ${(
      orderDetails.amount || 0
    ).toLocaleString()}₫</p>

    <p style="font-size: 12px;text-align: center; ">Sử dụng mã QR này tại quầy để quét và nhận thức ăn của bạn.</p>
    <p style="font-size: 12px;text-align: center; ">Vui lòng giữ mã QR này riêng tư và không chia sẻ cho bất kỳ ai khác.</p>
    <div style="text-align: center; margin: 20px;">
      <img src="${qrCode}" alt="QR Code" style="max-width: 200px;" />
    </div>
  </div>`;
};

module.exports = { generateOrderHTML };
