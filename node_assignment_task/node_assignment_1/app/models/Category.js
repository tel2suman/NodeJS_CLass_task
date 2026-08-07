const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;