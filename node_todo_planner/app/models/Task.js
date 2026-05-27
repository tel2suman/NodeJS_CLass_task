const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TaskSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    task_title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    task_description: {
      type: String,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed"],
      default: "Pending",
    },

    due_date: {
      type: Date,
      default: Date.now,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    labelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
    },

  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const TaskModel = mongoose.model("Task", TaskSchema);

module.exports = TaskModel;
