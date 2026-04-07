
const Customer = require("../models/customer");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");


class CustomerController {
  async createCustomer(req, res) {
    try {
      const { name, email, city } = req.body;

      if (!name || !email || !city) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existUser = await Customer.findOne({ email });

      if (existUser) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "customer already exist",
        });
      }

      const customerdata = new Customer({
        name,
        email,
        city,
      });

      const data = await customerdata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "customer registered successfully!!",
        data: data,
      });

    } catch (error) {

      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async loginCustomer(req, res) {
    try {

      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const user = await Customer.findOne({ email });

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "customer not found",
        });
      }

      if (user) {
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            city: user.city,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" },
        );

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "customer login successfull!!",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            city: user.city,
          },
          token: token,
        });
      } else {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "customer not found",
        });
      }
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}


module.exports = new CustomerController();