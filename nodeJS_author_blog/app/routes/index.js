
const express = require("express");

const router = express.Router();

//defining routes
const authRoute = require("./authRoute");

const blogRoute = require("./blogRoute");

router.use(authRoute);

router.use(blogRoute);

module.exports = router;