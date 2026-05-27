const express = require("express");

const ReminderController = require("../controllers/ReminderController");

const authCheck = require("../middleware/authCheck");

const router = express.Router();

router.use(authCheck);


router.post(
  "/create-reminder",
  ReminderController.setReminder,
);

router.put("/update-reminder/:reminderId", ReminderController.updateReminder);

router.delete("/delete-reminder/:reminderId", ReminderController.deleteReminder);

router.get("/task-summary", ReminderController.getTaskSummary);

router.get("/task-insights", ReminderController.getTaskInsights);

module.exports = router;