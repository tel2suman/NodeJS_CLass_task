const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employee_id: {
      type: Number,
      required: true,
      unique: true,
    },
    
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    email: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    department: {
      name: {
        type: String,
        required: true,
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Employee = mongoose.model("employee", employeeSchema);

module.exports = Employee;