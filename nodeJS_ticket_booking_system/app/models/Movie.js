
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MovieSchema = new Schema(
  {
    movie_name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },

    genre: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    cast: {
      type: String,
      required: true,
    },

    director: {
      type: String,
      required: true,
    },

    release_date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    versionKey: false,
  },
);

const MovieModel = mongoose.model("Movie", MovieSchema);

module.exports = MovieModel;