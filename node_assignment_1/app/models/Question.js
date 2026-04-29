const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true, // ⚡ faster queries
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// 🔍 Prevent duplicate questions in same category
QuestionSchema.index({ question: 1, categoryId: 1 }, { unique: true });

const QuestionModel = mongoose.model("Question", QuestionSchema);

module.exports = QuestionModel;