
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
      require: true,
      trim: true, // 🧼 remove spaces
      lowercase: true,
    },

    categoryDescription: {
      type: String,
      trim: true, // 🧼 remove spaces
      required: true,
    },

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

    labelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
      required: true,
    },

    createOn: {
      type: Date,
      default: new Date(),
    },

    updateOn: {
      type: Date,
      default: new Date(),
    },
  },
  {
    versionKey: false,
  },
);

const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;
