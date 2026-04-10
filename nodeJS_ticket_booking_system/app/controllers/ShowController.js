
const Movie = require("../models/Movie");

const Show = require("../models/Show");

const Theater = require("../models/Theater");

const StatusCode = require("../utils/StatusCode");

class ShowController {

    async createShow(req, res) {

        try {

            const {
              movieId,
              theaterId,
              screen_Number,
              show_Time,
              total_Seats,
            } = req.body;

            if (
              !movieId ||
              !theaterId ||
              !screen_Number ||
              !show_Time ||
              !total_Seats
            ) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "all fields are required",
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

            const showdata = new Show({
              movieId,
              theaterId,
              screen_Number,
              show_Time,
              total_Seats,
            });

            const data = await showdata.save();

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
}

module.exports = new ShowController();