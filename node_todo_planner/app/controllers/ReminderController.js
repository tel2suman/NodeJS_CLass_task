
const Reminder = require("../models/Reminder");

const Task = require("../models/Task");

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

}



module.exports = new ReminderController();