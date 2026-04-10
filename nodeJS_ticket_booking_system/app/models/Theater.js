
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheaterSchema = new Schema(
  {
    theater_name: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    screen_number: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const TheaterModel = mongoose.model("Theater", TheaterSchema);

module.exports = TheaterModel;