
const Author = require("../models/author");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

class AuthorController {

  async createAuthor(req, res) {

    try {
      const { name, email, password, about } = req.body;

      if (!name || !email || !password || !about) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existUser = await Author.findOne({ email });

      if (existUser) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user already exist",
        });
      }

      const salt = await bcrypt.genSalt(10);

      const hashedpassword = await bcrypt.hash(password, salt);

      const authordata = new Author({
        name,
        email,
        password: hashedpassword,
        about,
      });

      const data = await authordata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "user registered successfull!!",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async loginAuthor(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const user = await Author.findOne({ email });

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "author not found",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "password does not match",
        });
      }

      if (user) {
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" },
        );

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "author login successfull!!",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password,
          },
          token: token,
        });

      } else {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user not found",
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

module.exports = new AuthorController();