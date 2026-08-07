
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExamResultSchema = new Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    obtainedMarks: {
      type: Number,
      required: true,
    },

    grade: {
      type: String,
    },

    resultStatus: {
      type: String,
      enum: ["pass", "fail"],
      default: "pass",
    },
  },
  {
    versionKey: false,
  },
);

const ExamResultModel = mongoose.model("ExamResult", ExamResultSchema);

module.exports = ExamResultModel;