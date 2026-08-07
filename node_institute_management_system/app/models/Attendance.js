
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendanceDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },

    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

AttendanceSchema.index(
  {
    batchId: 1,
    studentId: 1,
    attendanceDate: 1,
  },
  {
    unique: true,
  },
);

const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);

module.exports = AttendanceModel;