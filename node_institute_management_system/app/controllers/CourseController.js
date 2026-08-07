
const Course = require("../models/Course");

const StatusCode = require("../utils/StatusCode");


class CourseController {

    async createCourse(req, res) {

        try {

            const {
              courseName,
              courseCode,
              description,
              durationMonths,
              fees,
            } = req.body;

            if (!courseName || !courseCode || !description || !durationMonths || !fees) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "all fields are required",
                });
            }

            const existCourse = await Course.findOne({ courseName });

            if (existCourse) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Course already exist",
                });
            }

            const coursedata = new Course({
              courseName,
              courseCode,
              description,
              durationMonths,
              fees,
            });

            const course = await coursedata.save();

            // Your record creation logic here
            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "Course created successfully.",
              data: course,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async updateCourse(req, res) {

        try {

            const { Id } = req.params;

            const { courseName, courseCode, description, durationMonths, fees } = req.body;

            if (!Id) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "oops, course id required!",
                });
            }

            // ✅ Only update task that belongs to logged-in user
            const course = await Course.findByIdAndUpdate(
              {
                _id: Id,
                userId: req.user.userId, // 🔐 ownership check
              },
              { courseName, courseCode, description, durationMonths, fees },
              { new: true },
            );

            if (!course) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Course not found",
                });
            }

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "Course updated successfully",
              data: course,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }

    async deleteCourse(req, res) {
        try {

          const { Id } = req.params;

          if (!Id) {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "oops, course id required!",
            });
          }

          const course = await Course.findByIdAndDelete(Id);

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "course deleted",
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
}



module.exports = new CourseController();