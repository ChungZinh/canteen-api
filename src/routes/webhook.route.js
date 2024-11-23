const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");

router.post("/casso", (req, res) => {
  console.log("Dữ liệu nhận được:", req.body);
  res.status(200).send("Webhook nhận thành công"); // Gửi phản hồi về Casso
});

module.exports = router;
