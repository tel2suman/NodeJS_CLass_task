
const express = require("express");

const router = express.Router();

//defining routes
const CustomerRoute = require("./CustomerRoute");

const InventoryRoute = require("./InventoryRoute");

const OrderRoute = require("./OrderRoute");

const OrderItemRoute = require("./OrderItemRoute");

const PaymentRoute = require("./PaymentRoute");

const LookupRoute = require("./LookupRoute");

router.use(CustomerRoute);

router.use(InventoryRoute);

router.use(OrderRoute);

router.use(OrderItemRoute);

router.use(PaymentRoute);

router.use(LookupRoute);

module.exports = router;
