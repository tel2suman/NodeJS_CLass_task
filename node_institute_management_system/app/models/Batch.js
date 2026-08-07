
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BatchSchema = new Schema(
  {
    batchName: {
      type: String,
      trim: true,
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    maxStudents: {
      type: Number,
      default: 30,
    },

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },

    is_verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
  },
);

const BatchModel = mongoose.model("Batch", BatchSchema);

module.exports = BatchModel;