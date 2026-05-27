const express = require("express");

const LabelController = require("../controllers/LabelController");

const authCheck = require("../middleware/authCheck");

const router = express.Router();

router.use(authCheck);

router.post(
  "/create-label",
  LabelController.createLabel,
);

router.get("/label/with/category", LabelController.GetCategoryWithLabelsForUser);

module.exports = router;