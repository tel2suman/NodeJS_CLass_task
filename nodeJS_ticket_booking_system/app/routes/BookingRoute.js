
const express = require("express");

const BookingController = require("../controllers/BookingController");

const authChek = require("../middleware/authCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(authChek);

router.post(
  "/create-booking",
  Rolechek("admin"),
  BookingController.createBooking
);

router.put(
  "/cancel-booking/:id",
  Rolechek("admin"),
  BookingController.cancelBooking
);

router.get("/my-bookings", BookingController.allBookingHistory);

router.get(
  "/movie-booking-report",
  Rolechek("admin"),
  BookingController.getMoviesWithBookings
);

router.get(
  "/theater-booking-report",
  Rolechek("admin"),
  BookingController.getBookingsByTheater
);

module.exports = router;
