
const express = require("express");

const OrderController = require("../controllers/OrderController");

const router = express.Router();

router.post("/create-order", OrderController.createOrder);

module.exports = router;