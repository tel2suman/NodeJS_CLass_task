const express = require("express");

const router = express.Router();

const authCheck = require("../middleware/authCheck");

const RoleCheck = require("../middleware/roleCheck");

const EnrollmentController = require("../controllers/EnrollmentController");

router.post(
  "/student/enrollment",
  authCheck, RoleCheck("Admin"), EnrollmentController.assignStudentToBatch,
);

module.exports = router;
