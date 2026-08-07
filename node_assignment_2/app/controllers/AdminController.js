const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const StatusCode = require("../utils/StatusCode");

const genPass = require("../utils/genPass");

class AdminController {
  //register view
  signupPage(req, res) {
    res.render("signup", {
      title: "Signup Page",
    });
  }

  // Login page
  async loginPage(req, res) {
    res.render("login", {
      title: "Login Page",
    });
  }

  async Signup(req, res) {
    try {
      const { name, email, phone, role } = req.body;

      if (!name || !email || !phone) {
        req.flash("error", "All fields are required");

        return res.redirect("/signup/view");
      }

      const existUser = await User.findOne({ email });

      if (existUser) {
        return res.render("signup", {
          title: "Signup Page",
          message: "User already exists",
        });
      }

      // Generate password
      const password = genPass;

      // Hash password
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(password, salt);

      const userdata = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "Admin",
      });

      const protocol = req.protocol; // http or https

      const host = req.get("host"); // domain + port

      const loginUrl = `${protocol}://${host}/login/view`;

      // Send email with credentials
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Login Credentials",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Login Credentials</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: Arial, sans-serif;">

          <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin-top:30px;">

            <!-- Header -->
            <tr>
              <td style="background-color:#1e3a8a; padding:20px; text-align:center; color:#ffffff;">
                <h2 style="margin:0;">Employee Management System</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="background-color:#ffffff; padding:30px;">
                <h3 style="margin-top:0; color:#333;">Welcome, ${name} 👋</h3>

                <p style="color:#555; font-size:14px; line-height:1.6;">
                  Your account has been successfully created. Below are your login credentials:
                </p>

                <table width="100%" cellpadding="10" cellspacing="0" style="background:#f9fafb; border:1px solid #e5e7eb; margin-top:15px;">
                  <tr>
                    <td style="font-weight:bold; width:0px; font-size:15px">Email:</td>
                    <td style="font-size:15px">${email}</td>
                  </tr>
                  <tr>
                    <td style="font-weight:bold; width:0px; font-size:15px">Password:</td>
                    <td style="font-size:15px">${password}</td>
                  </tr>
                </table>

                <p style="color:#555; font-size:14px; margin-top:20px;">
                  ⚠️ For security reasons, please change your password after your first login.
                </p>

                <div style="text-align:center; margin-top:25px;">
                  <a href="${loginUrl}"
                    style="background-color:#1e3a8a; color:#ffffff; padding:12px 20px;
                    text-decoration:none; border-radius:5px; display:inline-block;">
                    Login Now
                  </a>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} Employee Management System. All rights reserved.
              </td>
            </tr>

          </table>

        </body>
        </html>
        `,
      });

      return res.redirect("/login/view");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/signup/view");
    }
  }

  //login User
  async Login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "Email & Passwords are required");

        return res.redirect("/login/view");
      }

      const user = await User.findOne({ email });

      if (!user) {
        req.flash("error", "Invalid Credentials");

        return res.redirect("/login/view");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        req.flash("error", "Password does not match");

        return res.redirect("/login/view");
      }

      const accessToken = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" },
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      if (accessToken && refreshToken) {
        res.cookie("accessToken", accessToken, {
          sameSite: "strict",
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
        });
      }

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.flash("success", "Welcome To Dashboard Successfully");

      return res.redirect("/dashboard");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/login/view");
    }
  }

  // dashboard page
  async dashboard(req, res) {
    try {
      const data = await User.findById(req.user.userId);

      if (!data) {
        return res.render("dashboard", {
          title: "Dashboard Not Found",
          data: null,
        });
      }

      res.render("dashboard", {
        title: "Dashboard Page",
        data: data,
      });
    } catch (error) {
      req.flash("error", "Error loading dashboard");

      res.status(500).send("Error loading dashboard");
    }
  }

  // logout user
  async Logout(req, res) {

    try {

      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {

        const user = await User.findOne({ refreshToken });

        if (user) {
          user.refreshToken = null;

          await user.save();
        }
      }

      // clear cookie
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.redirect("/login/view");

    } catch (error) {

      req.flash("error", error.message);
    }
  }
}


module.exports = new AdminController();