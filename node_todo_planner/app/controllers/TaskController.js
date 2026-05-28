const Task = require("../models/Task");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

const mongoose = require("mongoose");
class TaskController {
  async createTask(req, res) {
    try {
      const { task_title, task_description, priority, status, userId } =
        req.body;

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

      // Validate status
      const allowedStatus = ["Pending", "InProgress", "Completed"];

      // Base query
      let matchQuery = {
        userId: new mongoose.Types.ObjectId(req.user._id),
      };

      // Status filter
      if (status) {
        if (!allowedStatus.includes(status)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid task status",
          });
        }

        matchQuery.status = status;
      }

      // Date filters
      let startDate;
      let endDate;

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (filter === "today") {
        startDate = new Date(today);

        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
      } else if (filter === "tomorrow") {
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() + 1);

        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 2);
      } else if (filter === "week") {
        startDate = new Date(today);

        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 7);
      }

      // Apply date filter
      if (startDate && endDate) {
        matchQuery.due_date = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      // Aggregate tasks
      const tasks = await Task.aggregate([
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
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 1,
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

  async getTaskStatictics(req, res) {
    try {
       const userId = new mongoose.Types.ObjectId(req.user._id);

       const insights = await Task.aggregate([
         {
           $match: {
             userId: userId,
           },
         },

         {
           $group: {
             _id: null,

             totalTasks: {
               $sum: 1,
             },

             completedTasks: {
               $sum: {
                 $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
               },
             },

             pendingTasks: {
               $sum: {
                 $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
               },
             },

             inProgressTasks: {
               $sum: {
                 $cond: [{ $eq: ["$status", "InProgress"] }, 1, 0],
               },
             },

             averageCompletionTime: {
               $avg: {
                 $cond: [
                   {
                     $and: [
                       { $eq: ["$status", "Completed"] },
                       { $ne: ["$completedAt", null] },
                     ],
                   },

                   {
                     $divide: [
                       {
                         $subtract: ["$completedAt", "$createdAt"],
                       },
                       1000 * 60 * 60,
                     ],
                   },

                   null,
                 ],
               },
             },
           },
         },

         {
           $project: {
             _id: 0,

             totalTasks: 1,
             completedTasks: 1,
             pendingTasks: 1,
             inProgressTasks: 1,

             completionRate: {
               $cond: [
                 { $eq: ["$totalTasks", 0] },

                 0,

                 {
                   $round: [
                     {
                       $multiply: [
                         {
                           $divide: ["$completedTasks", "$totalTasks"],
                         },
                         100,
                       ],
                     },
                     2,
                   ],
                 },
               ],
             },

             averageCompletionTimeHours: {
               $round: [
                 {
                   $ifNull: ["$averageCompletionTime", 0],
                 },
                 2,
               ],
             },
           },
         },
       ]);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Task insights generated successfully",
        data: insights[0] || {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completionRate: 0,
          averageCompletionTimeHours: 0,
        },
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