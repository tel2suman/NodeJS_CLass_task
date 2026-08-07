const express = require("express");

const router = express.Router();

const UserRoute = require("./UserRoute");

const CategoryRoute = require("./CategoryRoute");

const ProductRoute = require("./ProductRoute");

router.use(UserRoute);

router.use(CategoryRoute);

router.use(ProductRoute);

module.exports = router;