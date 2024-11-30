const express = require("express");
const router = express.Router();

router.use("/api/v1/auth", require("./auth.route"));
router.use("/api/v1/foods", require("./food.route"));
router.use("/api/v1/categories", require("./category.route"));
router.use("/api/v1/orders", require("./order.route"));
router.use("/api/v1/discounts", require("./discount.route"));
router.use("/api/v1/users", require("./user.route"));
router.use("/api/v1/menus", require("./menu.route"));
router.use("/api/v1/contact", require("./contact.route"));
router.use("/api/v1/webhook", require("./webhook.route"));
router.use("/api/v1/points", require("./point.route"));
module.exports = router;
