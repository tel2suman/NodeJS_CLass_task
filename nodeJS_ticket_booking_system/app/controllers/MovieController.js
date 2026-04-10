
const Movie = require("../models/Movie");

const StatusCode = require("../utils/StatusCode");

class MovieController {

  async createMovie(req, res) {
    try {

      const { movie_name, genre, language, duration, cast, director } =
        req.body;

      if (
        !movie_name ||
        !genre ||
        !language ||
        !duration ||
        !cast ||
        !director
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existMovie = await Movie.findOne({ movie_name });

      if (existMovie) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "movie already exist",
        });
      }

      const moviedata = new Movie({
        movie_name,
        genre,
        language,
        duration,
        cast,
        director,
      });

      const data = await moviedata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "movie registered successfully",
        data: data,
      });
    } catch (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: error.message,
        });
    }
  }

  //view record
  async viewAllMovie(req, res) {

    try {

      const data = await Movie.find();

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "movie listing is here",
            total: data.length,
            data: data,
        });

    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
  }

  // async update record
  async updateMovieDetails(req, res) {

    try {

      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, movie id required!",
        });
      }

      // 1. Get existing user first
      const existingMovie = await Movie.findById(id);

      if (!existingMovie) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "movie not found",
        });
      }

      const data = await Movie.findByIdAndUpdate(id, req.body, { new: true });

      // Handle logic
        res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "movie updated successfully",
            data: data,
        });

    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
  }

  // delete product
  async deleteMovie(req, res) {

    try {
      const id = req.params.id;

      const data = await Movie.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "movie deleted succesfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new MovieController();