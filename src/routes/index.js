const express = require("express");
const router = express.Router();


router.use("/api/v1/auth", require("./auth.route"));
router.use("/api/v1/foods", require("./food.route"));
router.use("/api/v1/categories", require("./category.route"));
module.exports = router;
