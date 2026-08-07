
const express = require("express");

const router = express.Router();

const UserRoute = require("./UserRoute");

const CategoryRoute = require("./CategoryRoute")

const QuestionRoute = require("./QuestionRoute")

router.use(UserRoute);

router.use(CategoryRoute);

router.use(QuestionRoute);


module.exports = router;