
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Batch = require("../models/Batch");

const StatusCode = require("../utils/StatusCode");

class EnrollmentController {

    async assignStudentToBatch(req, res) {

        try {

            const { studentId, batchId } = req.body;

            if (!studentId || !batchId) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "all fields are required",
                });
            }

            // Check student
            const student = await User.findOne({
              _id: studentId,
              role: "Student",
            });

            if (!student) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Student not found.",
                });
            }

            // Check batch
            const batch = await Batch.findById(batchId);

            if (!batch) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Batch not found.",
                });
            }

            // Check duplicate enrollment
            const alreadyAssigned = await Enrollment.findOne({
                studentId,
                batchId,
            });

            if (alreadyAssigned) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Student is already assigned to this batch.",
                });
            }

            const enrollment = await Enrollment.create({
                studentId,
                batchId,
                courseId: batch.courseId,
                assignedBy: req.user._id,
            });

            res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "Student assigned successfully.",
              data: enrollment,
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message,
            });
        }
    }
}


module.exports = new EnrollmentController();