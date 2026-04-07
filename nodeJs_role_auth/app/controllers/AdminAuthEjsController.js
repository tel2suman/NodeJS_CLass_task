const User = require("../models/user");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

class AuthEjsController {

  async AdminCheckAuth(req, res, next) {
    try {

      if (req.admin) {

        next();

      } else {

        res.redirect("/admin/login");
      }
    } catch (error) {

      req.flash(error);
    }
  }

  login(req, res) {
    res.render("admin/index", {
      title: "Login Page",
    });
  }

  // create admin login
  async loginPost(req, res) {

    try {
      // Get user input
      const { email, password } = req.body;

      // Validate user input
      if (!(email && password)) {

        console.log("All input is required");

        return res.redirect("/admin/login");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });

      if (user && user.is_admin === "admin" && (await bcrypt.compare(password, user.password))) {
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

          res.cookie("admintoken", token);

          return res.redirect("/admin/dashboard");

        } else {

           req.flash("login failed");
        }
      }

       req.flash("login failed");

    } catch (error) {

        req.flash(error);
    }

  }



  dashboard(req, res) {
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      data: req.admin,
    });
  }

  adminlogout(req, res) {
    res.clearCookie("admintoken");
    return res.redirect("/admin/login");
  }
}

module.exports = new AuthEjsController();