
const express = require("express");

const CustomerController = require("../controllers/CustomerController");

const router = express.Router();

router.post("/create-customer", CustomerController.createCustomer);

router.post("/login-customer", CustomerController.loginCustomer);

module.exports = router;