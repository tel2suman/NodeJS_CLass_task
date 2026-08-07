const express = require("express");

const router = express.Router();

const UserRoute = require("./UserRoute");

const CourseRoute = require("./CourseRoute");

const BatchRoute = require("./BatchRoute");

const EnrollmentRoute = require("./EnrollmentRoute");

router.use(UserRoute);

router.use(BatchRoute);

router.use(CourseRoute);

router.use(EnrollmentRoute);

module.exports = router;