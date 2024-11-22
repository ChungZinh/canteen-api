const QRCode = require("qrcode");

const generateQRCode = async (url) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url);
    console.log("QR Code generated successfully!");
    return qrCodeDataURL;
  } catch (error) {
    console.error("Failed to generate QR Code:", error);
  }
};

module.exports = generateQRCode;
