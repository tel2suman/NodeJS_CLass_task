
const express = require("express");

const router = express.Router();

const UserRoute = require("./UserRoute");

const MovieRoute = require("./MovieRoute");

const TheaterRoute = require("./TheaterRoute");

const ShowRoute = require("./ShowRoute");

const BookingRoute = require("./BookingRoute");

router.use(UserRoute);

router.use(MovieRoute);

router.use(TheaterRoute);

router.use(ShowRoute);

router.use(BookingRoute);

module.exports = router;