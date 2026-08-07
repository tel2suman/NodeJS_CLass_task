
const express = require("express");

const CourseController = require("../controllers/CourseController");

const authCheck = require("../middleware/authCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(authCheck);

router.post("/create/course", Rolechek("Admin"), CourseController.createCourse);

router.put(
  "/update/course/:Id", Rolechek("Admin"), CourseController.updateCourse,
);

router.delete(
  "/delete/course/:Id", Rolechek("Admin"), CourseController.deleteCourse,
);

module.exports = router;