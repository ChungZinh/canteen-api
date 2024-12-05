const CryptoJS = require("crypto-js");

const encodeOrderId = (orderId) => {
  // Đảm bảo orderId là một chuỗi
  const idAsString = orderId.toString(); 
  const hash = CryptoJS.SHA256(idAsString).toString(CryptoJS.enc.Base64);

  const shortHash = hash.slice(0, 8);
  return shortHash.toUpperCase();
};

module.exports = encodeOrderId;
