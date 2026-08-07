
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExamSchema = new Schema(
  {
    examName: {
      type: String,
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    passingMarks: {
      type: Number,
      required: true,
    },

    examType: {
      type: String,
      enum: ["quiz", "midterm", "final"],
      default: "quiz",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ExamModel = mongoose.model("Exam", ExamSchema);

module.exports = ExamModel;