
const mongoose = require("mongoose");

const Batch = require("../models/Batch");

const Attendance = require("../models/Attendance");

const User = require("../models/User");

const StatusCode = require("../utils/StatusCode");

class AttendanceController {

  async markAttendance(req, res) {

    try {

      const { batchId, date, presentStudents, absentStudents } = req.body;

      if (
        !batchId ||
        !date ||
        !Array.isArray(presentStudents) ||
        !Array.isArray(absentStudents) ||
        (presentStudents.length === 0 && absentStudents.length === 0)
        ) {
            return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "All fields are required",
            });
        }

        const existingAttendance = await Attendance.findOne({
            batchId,
            attendanceDate: date,
        });

        if (existingAttendance) {
            return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Attendance already marked for this batch and date",
            });
        }

        const attendanceRecords = [
            ...presentStudents.map((studentId) => ({
                batchId,
                studentId,
                teacherId: req.user._id,
                attendanceDate: date,
                status: "present",
            })),

            ...absentStudents.map((studentId) => ({
                batchId,
                studentId,
                teacherId: req.user._id,
                attendanceDate: date,
                status: "absent",
            })),
        ];

      await Attendance.insertMany(attendanceRecords);

        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "Attendance marked successfully",
            totalRecords: attendanceRecords.length,
        });

    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
  }
}


module.exports = new AttendanceController();