
const express = require("express");

const BatchController = require("../controllers/BatchController");

const authCheck = require("../middleware/authCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(authCheck);

router.post("/create/batch", Rolechek("Admin", "Teacher"), BatchController.createBatch);

router.get(
  "/courses/batches/:courseId",
  Rolechek("Admin", "Teacher"),
  BatchController.getCourseBatches,
);

router.put(
  "/update/batch/:batchId",
  Rolechek("Admin", "Teacher"),
  BatchController.updateBatch,
);

router.delete(
  "/delete/batch/:batchId",
  Rolechek("Admin"),
  BatchController.deleteBatch,
);

module.exports = router;