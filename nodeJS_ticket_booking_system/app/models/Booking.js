
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },

    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    show_name: {
      type: String,
      required: true,
    },

    tickets_booked: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["booked", "pending", "cancelled"],
      default: "booked",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const BookingModel = mongoose.model("Booking", BookingSchema);

module.exports = BookingModel;