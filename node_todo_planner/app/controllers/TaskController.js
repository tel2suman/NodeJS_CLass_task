const Task = require("../models/Task");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

class TaskController {
  async createTask(req, res) {
    try {
      const { task_title, task_description, priority, status, userId } = req.body;

      if (!task_title || !task_description) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existTask = await Task.findOne({ task_title });

      if (existTask) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Task already exist",
        });
      }

      const taskdata = new Task({
        task_title,
        task_description,
        priority,
        status,
        userId,
      });

      const task = await taskdata.save();

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Task created successfully.",
        data: task,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateTask(req, res) {
    try {
      const { taskId } = req.params;

      const { task_title, task_description, status } = req.body;

      if (!taskId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, task id required!",
        });
      }

      // ✅ Only update task that belongs to logged-in user
      const task = await Task.findByIdAndUpdate(
        {
          _id: taskId,
          userId: req.user.userId, // 🔐 ownership check
        },
        { task_title, task_description, status },
        { new: true },
      );

      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteTask(req, res) {

    try {

      const { taskId } = req.params;

        if (!taskId) {
            return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "oops, task id required!",
            });
        }

      const category = await Task.findByIdAndDelete(taskId);

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "task deleted",
        });

    } catch (error) {

        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
  }

  async listTasks(req, res) {

    try {

      const { status, filter } = req.query;

      // Base match query
      let matchQuery = {
        userId: req.user._id,
      };

      // Filter by status
      if (status) {
        matchQuery.status = status;
      }

      // Date filters
      let startDate;

      let endDate;

      const today = new Date();

      if (filter === "today") {
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );

        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        );
      }

      if (filter === "tomorrow") {
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        );

        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 2,
        );
      }

      if (filter === "week") {
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );

        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 7,
        );
      }

      // Apply due_date filter
      if (startDate && endDate) {
        matchQuery.due_date = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      // Aggregation with lookup
      const tasks = await TaskModel.aggregate([

        {
          $match: matchQuery,
        },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $project: {
            task_title: 1,
            task_description: 1,
            priority: 1,
            status: 1,
            due_date: 1,
            createdAt: 1,

            "user._id": 1,
            "user.name": 1,
            "user.email": 1,
          },
        },

        {
          $sort: {
            due_date: 1,
          },
        },
      ]);

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            totalTasks: tasks.length,
            tasks,
        });
    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
    }
  }
}


module.exports = new TaskController();