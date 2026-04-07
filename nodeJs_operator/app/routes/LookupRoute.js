
const express = require("express");

const LookupController = require("../controllers/LookupController");

const router = express.Router();

router.get("/customer/all/orders", LookupController.allCustomersByOrders);

router.get("/customer/orders", LookupController.getOrdersWithCustomers);

router.get("/customer/one/orders", LookupController.CustomerWithOneOrders);

router.get("/customer/without/orders", LookupController.CustomerWithoutOrders);

router.get("/order/with/payments", LookupController.getOrdersWithPaymentStatus);

router.get("/customer/latest/orders", LookupController.customerWithLatestOrder);

module.exports = router;