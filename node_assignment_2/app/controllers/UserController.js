const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

class UserController {

  // Register Product page
  async addUserPage(req, res) {

    try {

      const userproduct = await User.find();

        res.render("add_user", {
            title: "User Create Page",
            userproduct,
        });

    } catch (error) {

      console.log(error.message);
    }
  }

  // create record
  async createUser(req, res) {
    try {
      const user = req.user; // Get from auth middleware

      if (!user) {

        return res.redirect("/add/user");
      }

      const { name, email, password } = req.body;

      const data = new User({
        name,
        email,
        password,
      });

      const userdata = await data.save();

      // Your record creation logic here
      if (userdata) {
        res.redirect("/dashboard");
      } else {
        res.redirect("/add/user");
      }

    } catch (error) {

      console.log("Error storing product:", error);

      return res.status(500).send("Something went wrong");
    }
  }

  //view record
  async viewUser(req, res) {
    try {
      const data = await User.find();

        res.render("dashboard", {
            title: "Dashboard",
            data: data,
        });

    } catch (error) {

      console.log(error);
    }
  }

  // async update record
  async updateUser(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.redirect("/add/user");
      }

      const productuser = await User.findById(id);

      if (!productuser) {
        return res.redirect("/add/user");
      }

      const data = await User.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      // Handle logic
      return res.redirect("/dashboard");

    } catch (error) {

      console.log(error);

      return res.status(500).send("Something went wrong");
    }
  }

  // delete product
  async deleteUser(req, res) {

   try {

    const id = req.params.id;

    if (!id) {

       return res.redirect("/dashboard");
    }

    const data = await User.findByIdAndDelete(id);

     if (!data) {

       return res.redirect("/dashboard");
    }

    return res.redirect("/dashboard");

   } catch (error) {
        console.error(error);

        return res.status(500).send("Something went wrong");
    }
  }
}

module.exports = new UserController();