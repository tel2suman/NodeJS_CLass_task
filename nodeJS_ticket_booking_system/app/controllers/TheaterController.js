
const Theater = require("../models/Theater");

const StatusCode = require("../utils/StatusCode");

class TheaterController {

    async createTheater(req, res) {

        try {

            const {
              theater_name,
              location,
              screen_number,
            } = req.body;

            if (
              !theater_name ||
              !location ||
              !screen_number
            ) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "all fields are required",
              });
            }

            const existTheatre = await Theater.findOne({ location });

            if (existTheatre) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "movie theater already exist",
              });
            }

            const theaterdata = new Theater({
              theater_name,
              location,
              screen_number,
            });

            const data = await theaterdata.save();

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "theater registered successfully",
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


module.exports = new TheaterController();

