const express = require("express");

const ShowController = require("../controllers/ShowController");

const authChek = require("../middleware/authCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(authChek);

router.post("/assign-movie", Rolechek("admin"), ShowController.createShow);

module.exports = router;
