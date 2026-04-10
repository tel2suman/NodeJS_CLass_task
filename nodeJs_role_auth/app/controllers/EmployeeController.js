
const Employee = require("../models/employee");

const StatusCode = require("../utils/StatusCode");

class EmployeeController {

    async createEmp(req, res) {

        try {
          const employees = req.body;

          // Check if array
          if (!Array.isArray(employees) || employees.length === 0) {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "Request body must be a non-empty array",
            });
          }

          // Basic validation
          for (const emp of employees) {
            const { firstName, lastName, gender, email, salary, department } =
              emp;

            if (
              !firstName?.trim() ||
              !lastName?.trim() ||
              !gender ||
              !email?.trim() ||
              !salary ||
              !department?.trim()
            ) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "All fields are required for each employee",
              });
            }

            if (isNaN(salary) || salary <= 0) {
              return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "Salary must be a positive number",
              });
            }
          }

          // Insert many
          const savedEmployee = await Employee.insertMany(employees, {
            ordered: true, // stops on first error (set false to continue)
          });

          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "Employee created successfully",
            data: savedEmployee,
          });
        } catch (error) {
            console.error("Bulk Insert Error:", error);
            return res.status(StatusCode.SERVER_ERROR).json({
              success: false,
              message: "Error creating employee",
              error: error.message,
            });
        }
    }
}

module.exports = new EmployeeController();