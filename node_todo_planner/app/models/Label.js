const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const labelSchema = new Schema(
  {
    labelName: {
      type: String,
      required: true,
      unique: true, // 🚀 prevent duplicates
      trim: true, // 🧼 remove spaces
      lowercase: true,
    },

    labelDesc: {
      type: String,
      trim: true, // 🧼 remove spaces
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

const labelModel = mongoose.model("Label", labelSchema);

module.exports = labelModel;
