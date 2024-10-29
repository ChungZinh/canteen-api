const moment = require("moment");

const createOrder = (config, amount, items, userID) => {
  const embed_data = {
    redirecturl: "https://www.youtube.com/",
  };
  const transID = Math.floor(Math.random() * 1000000);

  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: userID,
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: amount,
    description: `Canteen IUH - Thanh toán hóa đơn #${transID}`,
    bank_code: "zalopayapp",
    callback_url: config.callback_url,
  };

  return order;
};

module.exports = { createOrder };
