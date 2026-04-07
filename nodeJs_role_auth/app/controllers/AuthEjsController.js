
const User = require("../models/user");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");

const upload = require("../utils/CloudinaryImageUpload");

const fs = require("fs");

const sendEmail = require("../utils/sendMail");

const OTPModel = require("../models/otpModel");


class AuthEjsController {
  async CheckAuth(req, res, next) {
    try {
      if (req.user) {
        next();
      } else {
        res.redirect("/login/view");
      }
    } catch (error) {
      req.flash(error);
    }
  }

  //register view
  register(req, res) {
    res.render("register", {
      title: "Register Page",
    });
  }

  VerifyOtpPage(req, res) {
    res.render("verify_otp", {
      title: "Verify OTP Page",
    });
  }

  //create register
  async createRegister(req, res) {
    try {
      if (!req.file) {
        return res.redirect("/register/view");
      }

      //upload to clodinary
      const data = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
        width: 500,
        height: 500,
        crop: "limit",
        quality: "auto",
      });

      // Delete local file after upload (important)
      fs.unlinkSync(req.file.path);

      const users = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
        image: data.secure_url,
        public_id: data.public_id,
      });

      const result = await users.save();

      await sendEmail(req, result);

      console.log("data", result);

      if (result) {
        req.flash("register done successfully");

        return res.redirect("/verify/otpview");
      } else {
        req.flash("register failed");

        return res.redirect("/");
      }
    } catch (error) {
      // Delete file if exists (in case upload failed)
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      req.flash(error);
    }
  }

  //login view
  login(req, res) {
    res.render("login", {
      title: "Login Page",
    });
  }

  // create login
  async createLogin(req, res) {
    try {
      // Get user input
      const { email, password } = req.body;

      // Validate user input
      if (!(email && password)) {
        req.flash("All input is required");

        return res.redirect("/login/view");
      }

      // Validate if user exist in our database
      const user = await User.findOne({ email, is_admin: "user" });

      if (!user.is_verified) {

        req.flash("Your Account is Not Verified");

        return res.redirect("/verify/otpview");
      }

      if (
        user &&
        user.is_admin === "user" &&
        (await bcrypt.compare(password, user.password))
      ) {
        // Create token
        const token = jwt.sign(
          {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          process.env.JWT_SECRET_KEY || "secret",
          {
            expiresIn: "1d",
          },
        );

        if (token) {
          res.cookie("token", token);

          return res.redirect("/user/dashboard");
        } else {
          req.flash("login failed");
        }
      }

      return res.redirect("/login/view");

    } catch (error) {

      req.flash(error);
    }
  }

  async verify(req, res) {

    try {

      const { email, otp } = req.body;

      // Check if all required fields are provided

      if (!email || !otp) {

        req.flash("All input is required");

        return res.redirect("/verify/otpview");
      }

      const existingUser = await User.findOne({ email });

      // Check if email doesn't exists
      if (!existingUser) {

        req.flash("Email doesn't exists");

        return res.redirect("/verify/otpview");
      }

      // Check if email is already verified
      if (existingUser.is_verified) {

        req.flash("Email is already verified");

        return res.redirect("/verify/otpview");
      }

      // Check if there is a matching email verification OTP
      const emailVerification = await OTPModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {

        if (!existingUser.is_verified) {

          // console.log(existingUser);
          await sendEmail(req, existingUser);

            req.flash("Invalid OTP, new OTP sent to your email");

            return res.redirect("/verify/otpview");
        }

        req.flash("error","Invalid OTP");

        return res.redirect("/verify/otpview");
      }

      // Check if OTP is expired

      const currentTime = new Date();

      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).

      const expirationTime = new Date(

        emailVerification.createdAt.getTime() + 5 * 60 * 1000,
      );

      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await sendEmail(req, existingUser);

          req.flash("OTP expired, new OTP sent to your email");

          return res.redirect("/verify/otpview");

        }
      // OTP is valid and not expired, mark email as verified

      existingUser.is_verified = true;

      await existingUser.save();

      // Delete email verification document
      await OTPModel.deleteMany({ userId: existingUser._id });

        req.flash("register done successfully");

        return res.redirect("/user/dashboard");

    } catch (error) {

      console.error(error);

      req.flash(error);
    }
  }

  // dashboard view
  dashboard(req, res) {
    res.render("user_dashboard", {
      title: "User Dashboard Page",
      data: req.user,
    });
  }

  logout(req, res) {
    res.clearCookie("token");
    return res.redirect("/login/view");
  }
}


module.exports = new AuthEjsController();
