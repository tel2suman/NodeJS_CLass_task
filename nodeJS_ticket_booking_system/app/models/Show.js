
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ShowSchema = new Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },

    screen_Number: {
      type: Number,
      required: true,
    },

    show_Time: {
      type: String,
      required: true,
    },

    total_Seats: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ShowModel = mongoose.model("Show", ShowSchema);

module.exports = ShowModel;