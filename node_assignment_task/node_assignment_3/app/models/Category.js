
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      require: true,
      unique: true, // 🚀 prevent duplicates
      trim: true, // 🧼 remove spaces
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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
