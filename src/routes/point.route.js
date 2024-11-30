const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../helpers/asyncHandler");
const { authentification } = require("../auth/authUtils");
const PointController = require("../controllers/point.controller");

router.post("/", asyncHandler(PointController.applyPoint));

module.exports = router;
