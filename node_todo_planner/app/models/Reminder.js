const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reminderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    reminderTime: {
      type: Date,
      default: Date.now,
      required: true,
    },

    type: {
      type: String,
      enum: ["one-time", "daily", "weekly"],
      default: "one-time",
    },

    isSent: {
      type: Boolean,
      default: false,
    },

    message: {
      type: String,
      trim: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const reminderModel = mongoose.model("Reminder", reminderSchema);

module.exports = reminderModel;
