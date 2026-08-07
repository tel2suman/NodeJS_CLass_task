
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      trim: true,
      required: true,
    },

    courseCode: {
      type: String,
      unique: true,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      required: true,
    },

    durationMonths: {
      type: Number,
      required: true,
    },

    fees: {
      type: Number,
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

const CourseModel = mongoose.model("Course", CourseSchema);

module.exports = CourseModel;