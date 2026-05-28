const express = require("express");

const TaskController = require("../controllers/TaskController");

const authCheck = require("../middleware/authCheck");

const router = express.Router();

router.use(authCheck);

router.post(
  "/create-task",
  TaskController.createTask,
);

router.put(
  "/update-task/:taskId",
  TaskController.updateTask,
);

router.get(
  "/task-summary",
  TaskController.listTasks,
);

router.delete(
  "/delete-task/:taskId",
  TaskController.deleteTask,
);

router.get("/task-insights", TaskController.getTaskStatictics);

module.exports = router;