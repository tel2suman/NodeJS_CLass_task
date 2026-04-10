
const mongoose = require("mongoose");

const Movie = require("../models/Movie");

const Show = require("../models/Show");

const Theater = require("../models/Theater");

const Booking = require("../models/Booking");

const User = require("../models/User");

const StatusCode = require("../utils/StatusCode");



class BookingController {
  async createBooking(req, res) {
    try {
      const { userId, showId, movieId, theaterId, show_name, tickets_booked } =
        req.body;

      if (
        !userId ||
        !showId ||
        !movieId ||
        !theaterId ||
        !show_name ||
        !tickets_booked
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
      }

      const show = await Show.findById(showId);

      if (!show) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Show not found",
        });
      }

      if (show.total_Seats < tickets_booked) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Not enough seats available",
        });
      }

      const movie = await Movie.findById(movieId);

      if (!movie) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "movie not found",
        });
      }

      const theater = await Theater.findById(theaterId);

      if (!theater) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "theater not found",
        });
      }

      const bookingdata = new Booking({
        userId,
        showId,
        movieId,
        theaterId,
        show_name,
        tickets_booked,
        totalPrice: tickets_booked * 200,
      });

      const data = await bookingdata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Movie assigned to theater successfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async cancelBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await Booking.findById(id);

      if (!booking) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Booking not found",
        });
      }

      if (booking.status === "cancelled") {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Booking already cancelled",
        });
      }

      const show = await Show.findById(booking.showId);

      show.total_Seats === booking.tickets_booked;

      await show.save();

      booking.status = "cancelled";

      await booking.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async allBookingHistory(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);

      const lookupQuery = [
        {
          $match: { userId: userId },
        },

        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        {
          $unwind: "$movieDetails",
        },
        {
          $lookup: {
            from: "theaters",
            localField: "theaterId",
            foreignField: "_id",
            as: "theaterDetails",
          },
        },
        {
          $unwind: "$theaterDetails",
        },
        {
          $lookup: {
            from: "shows",
            localField: "showId",
            foreignField: "_id",
            as: "showDetails",
          },
        },
        {
          $unwind: "$showDetails",
        },
        {
          $project: {
            _id: 1,
            show_name: 1,
            tickets_booked: 1,
            totalPrice: 1,
            status: 1,
            createdAt: 1,
            movie_name: "$movieDetails.movie_name",
            theater_name: "$theaterDetails.theater_name",
            location: "$theaterDetails.location",
            screen_Number: "$showDetails.screen_Number",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      const aggblog = await Booking.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "All Customers Bookings",
        totalBooking: aggblog.length,
        data: aggblog,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMoviesWithBookings(req, res) {
    try {
      const lookupQuery = [
        {
          $match: { status: "booked" },
        },
        {
          $group: {
            _id: "$movieId",
            totalTicketsBooked: { $sum: "$tickets_booked" },
          },
        },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        {
          $unwind: "$movieDetails",
        },
        {
          $project: {
            _id: 1,
            movieId: "$_id",
            movie_name: "$movieDetails.movie_name",
            totalTicketsBooked: 1,
          },
        },
        {
          $sort: { totalTicketsBooked: -1 },
        },
      ];

      const moviebooking = await Booking.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "All Movie with Bookings",
        totalBooking: moviebooking.length,
        data: moviebooking,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getBookingsByTheater(req, res) {

    try {

      const lookupQuery = [
        {
          $match: { status: "booked" },
        },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        {
          $unwind: "$movieDetails",
        },
        {
          $lookup: {
            from: "theaters",
            localField: "theaterId",
            foreignField: "_id",
            as: "theaterDetails",
          },
        },
        {
          $unwind: "$theaterDetails",
        },
        {
          $group: {
            _id: {
              theaterId: "$theaterId",
              show_name: "$show_name",
              movieId: "$movieId",
            },
            theater_name: { $first: "$theaterDetails.theater_name" },
            location: { $first: "$theaterDetails.location" },
            movie_name: { $first: "$movieDetails.movie_name" },
            totalTicketsBooked: { $sum: "$tickets_booked" },
          },
        },
        {
          $group: {
            _id: "$_id.theaterId",
            theater_name: { $first: "$theater_name" },
            location: { $first: "$location" },
            shows: {
              $push: {
                movie_name: "$movie_name",
                tickets_booked: "$tickets_booked",
              },
            },
          },
        },
        {
          $sort: { theater_name: 1 },
        },
      ];

      const theaterbooking = await Booking.aggregate(lookupQuery);

      return res.status(StatusCode.SUCCESS).json({
        message: "All Bookings by Theater",
        totalBooking: theaterbooking.length,
        data: theaterbooking,
      });

    } catch (error) {

      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}


module.exports = new BookingController();