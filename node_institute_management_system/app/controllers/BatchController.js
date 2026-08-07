
const mongoose = require("mongoose");

const Batch = require("../models/Batch");

const User = require("../models/User");

const StatusCode = require("../utils/StatusCode");


class BatchController {
  async createBatch(req, res) {
    try {
      const {
        batchName,
        courseId,
        teacherId,
        startDate,
        endDate,
        maxStudents,
      } = req.body;

      if (!batchName || !courseId || !teacherId || !startDate || !endDate) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existBatch = await Batch.findOne({ batchName });

      if (existBatch) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Batch already exist",
        });
      }

      const batchdata = new Batch({
        batchName,
        courseId,
        teacherId,
        startDate,
        endDate,
        maxStudents,
      });

      const batch = await batchdata.save();

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Batch created successfully.",
        data: batch,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateBatch(req, res) {

    try {

      const { batchId } = req.params;

      const { batchName, teacherId, startDate, endDate, maxStudents, status } = req.body;

      if (!batchId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, batch id required!",
        });
      }

      // Validate teacher if teacherId is being updated
      if (teacherId) {
        const teacher = await User.findOne({
          _id: teacherId,
          role: "Teacher",
        });

        if (!teacher) {
          return res.status(StatusCode.NOT_FOUND).json({
            success: false,
            message: "Teacher not found",
          });
        }

        const updatedBatch = await Batch.findByIdAndUpdate(
          batchId,
          {
            batchName,
            teacherId,
            startDate,
            endDate,
            maxStudents,
            status,
          },
          {
            new: true, // Returns updated document
            runValidators: true, // Runs schema validators
          },
        );

        if (!updatedBatch) {
          return res.status(StatusCode.NOT_FOUND).json({
            success: false,
            message: "Batch not found",
          });
        }

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Batch updated successfully",
          batch: updatedBatch,
        });
      }

    } catch (error) {

      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteBatch(req, res) {

    try {

      const { batchId } = req.params;

      if (!batchId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, batch id required!",
        });
      }

      const batch = await Batch.findByIdAndDelete(batchId);

      return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "batch deleted",
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }


  async getCourseBatches(req, res) {

    try {

       const { courseId } = req.params;

        const lookupQuery = [
          {
            $match: {
              courseId: new mongoose.Types.ObjectId(courseId),
            },
          },
          // Teacher Details
          {
            $lookup: {
              from: "users",
              localField: "teacherId",
              foreignField: "_id",
              as: "teacher",
            },
          },
          {
            $unwind: {
              path: "$teacher",
              preserveNullAndEmptyArrays: true,
            },
          },
          // Enrolled Students
          {
            $lookup: {
              from: "enrollments",
              localField: "_id",
              foreignField: "batchId",
              as: "students",
            },
          },
          {
            $project: {
              _id: 1,
              batchName: 1,

              totalStudents: {
                $size: "$students",
              },

              assignedTeacher: {
                _id: "$teacher._id",
                fullName: "$teacher.name",
                email: "$teacher.email",
              },
            },
          },
        ];

        const batches = await Batch.aggregate(lookupQuery);

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "total batches with courses",
            totalLabels: batches.length,
            data: batches,
        });

    } catch (error) {
        res.status(StatusCode.SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
    }
  }
}




module.exports = new BatchController();