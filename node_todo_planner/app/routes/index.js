
const express = require("express");

const router = express.Router();

const UserRoute = require("./UserRoute");

const TaskRoute = require("./TaskRoute");

const CategoryRoute = require("./CategoryRoute");

const LabelRoute = require("./LabelRoute");

const ReminderRoute = require("./ReminderRoute");

router.use(UserRoute);

router.use(TaskRoute);

router.use(CategoryRoute);

router.use(LabelRoute);

router.use(ReminderRoute);

module.exports = router;