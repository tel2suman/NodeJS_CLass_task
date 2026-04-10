
const express = require("express");

const TheaterController = require("../controllers/TheaterController");

const authChek = require("../middleware/authCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(authChek);

router.post(
  "/create-theater",
  Rolechek("admin"),
  TheaterController.createTheater
);


module.exports = router;