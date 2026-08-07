const express = require("express");

const router = express.Router();

const AdminRoute = require("./AdminRoute");

//const employeeRoute = require("./employeeRoute");

//router.use(UserRoute);

router.use(AdminRoute);

module.exports = router;
