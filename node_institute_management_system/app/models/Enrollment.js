
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EnrollmentSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    enrollmentDate: {
      type: Date,
      default: Date.now,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial"],
      default: "pending",
    },

    enrollmentStatus: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Prevent duplicate enrollment
EnrollmentSchema.index(
  {
    studentId: 1,
    batchId: 1,
  },
  {
    unique: true,
  },
);

const EnrollmentModel = mongoose.model("Enrollment", EnrollmentSchema);

module.exports = EnrollmentModel;