
const express = require("express");

const OrderItemController = require("../controllers/OrderItemController");

const router = express.Router();

router.post("/create-order-item", OrderItemController.createOrderItem);

module.exports = router;