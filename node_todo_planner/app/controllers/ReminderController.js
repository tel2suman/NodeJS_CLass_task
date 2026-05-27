
const Reminder = require("../models/Reminder");

const Task = require("../models/Task");

const mongoose = require("mongoose");

const StatusCode = require("../utils/StatusCode");


class ReminderController {
  async setReminder(req, res) {
    try {
      const { userId, taskId, reminderTime, type, message } = req.body;

      // Validate task
      const task = await Task.findOne({
        _id: taskId,
        userId: req.user._id,
      });

      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Task not found",
        });
      }

      // Prevent past reminders
      if (new Date(reminderTime) < new Date()) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Reminder time cannot be in the past",
        });
      }

      // Create reminder
      const reminder = await Reminder.create({
        userId,
        taskId,
        reminderTime,
        type,
        message,
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Reminder added successfully",
        data: reminder,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateReminder(req, res) {
    try {
      const { reminderId } = req.params;

      const { reminderTime, type, message, status } = req.body;

      // Find reminder for logged in user
      const reminder = await Reminder.findById({
        _id: reminderId,
        userId: req.user.userId,
      });

      if (!reminder) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Reminder not found",
        });
      }

      // Prevent past reminder update
      if (reminderTime && new Date(reminderTime) < new Date()) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Reminder time cannot be in the past",
        });
      }

      // Update fields
      if (reminderTime) {
        reminder.reminderTime = reminderTime;
      }

      if (type) {
        reminder.type = type;
      }

      if (message) {
        reminder.message = message;
      }

      if (status) {
        reminder.status = status;
      }

      // Reset send state if updated
      reminder.isSent = true;

      await reminder.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Reminder updated successfully",
        data: reminder,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteReminder(req, res) {
    try {
      const { reminderId } = req.params;

      // Find reminder for logged in user
      const reminder = await Reminder.findById({
        _id: reminderId,
        userId: req.user.userId,
      });

      if (!reminder) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Reminder not found",
        });
      }

      // Delete reminder
      await Reminder.findByIdAndDelete(reminderId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Reminder deleted successfully",
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTaskSummary(req, res) {

    try {

      const { filter } = req.query;

      // today | week
      const userId = new mongoose.Types.ObjectId(req.user._id);

      let startDate;

      let endDate;

      const today = new Date();

      // Start of today
      const currentDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      if (filter === "today") {

        startDate = currentDate;

        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        );
      } else if (filter === "week") {
        startDate = currentDate;

        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 7,
        );
      } else {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Filter must be today or week",
        });
      }

      const summary = await Task.aggregate([
        {
          $match: {
            userId: userId,
            due_date: {
              $gte: startDate,
              $lt: endDate,
            },
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
          },
        },

        {
          $project: {
            _id: 0,
            totalTasks: 1,
            completedTasks: 1,
            pendingTasks: 1,
            inProgressTasks: 1,
          },
        },
      ]);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: `Task summary for ${filter}`,
        data: summary[0] || {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
        },
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

    async getTaskInsights(req, res) {

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
                $cond: [
                    { $eq: ["$status", "Completed"] },
                    1,
                    0,
                ],
                },
            },

            pendingTasks: {
                $sum: {
                $cond: [
                    { $eq: ["$status", "Pending"] },
                    1,
                    0,
                ],
                },
            },

            inProgressTasks: {
                $sum: {
                $cond: [
                    { $eq: ["$status", "InProgress"] },
                    1,
                    0,
                ],
                },
            },

            // Average completion time in hours
            averageCompletionTime: {
                $avg: {
                $cond: [
                    { $eq: ["$status", "Completed"] },

                    {
                    $divide: [
                        {
                        $subtract: [
                            "$updatedAt",
                            "$createdAt",
                        ],
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
                            $divide: [
                            "$completedTasks",
                            "$totalTasks",
                            ],
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
                "$averageCompletionTime",
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



module.exports = new ReminderController();