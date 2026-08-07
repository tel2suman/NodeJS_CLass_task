
const Author = require("../models/author");

const Blog = require("../models/blog");

const Category = require("../models/category");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const StatusCode = require("../utils/StatusCode");

class AuthorController {
  //register view
  createAuthorPage(req, res) {
    res.render("author_register", {
      title: "Author Register Page",
    });
  }

  // Login page
  async loginAuthorPage(req, res) {
    res.render("author_login", {
      title: "Author Login Page",
    });
  }

  // Dashboard page
  async dashboardPage(req, res) {

    const authorId = req.user.id;

    const blogs = await Blog.find({ authorId });

    res.render("author/author_dashboard", {
      title: "Author Dashboard",
    });
  }

  async createAuthor(req, res) {
    try {
      const { name, email, password, about, role } = req.body;

      if (!name || !email || !password || !about) {
        // return res.status(StatusCode.BAD_REQUEST).json({
        //   success: false,
        //   message: "all fields are required",
        // });
        req.flash("error_msg", "all fields are required");

        res.redirect("/register-view");
      }

      const existUser = await Author.findOne({ email });

      if (existUser) {
        // return res.status(StatusCode.BAD_REQUEST).json({
        //   success: false,
        //   message: "user already exist",
        // });
        req.flash("error_msg", "user already exist");

        res.redirect("/register-view");
      }

      const salt = await bcrypt.genSalt(10);

      const hashedpassword = await bcrypt.hash(password, salt);

      const authordata = new Author({
        name,
        email,
        password: hashedpassword,
        about,
        role,
      });

      const data = await authordata.save();

      // return res.status(StatusCode.SUCCESS).json({
      //   success: true,
      //   message: "user registered successfull!!",
      //   data: data,
      // });
      req.flash("success_msg", "You are now registered and can log in!");

      res.redirect("/login-view");

    } catch (error) {
      // return res.status(StatusCode.BAD_REQUEST).json({
      //   success: false,
      //   message: error.message,
      // });
       req.flash("error_msg", error.message);

       res.redirect("/register-view");
    }
  }

  async loginAuthor(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        // return res.status(StatusCode.BAD_REQUEST).json({
        //   success: false,
        //   message: "all fields are required",
        // });
        req.flash("error_msg", "user already exist");

        res.redirect("/login-view");
      }

      const user = await Author.findOne({ email });

      if (!user) {
        // return res.status(StatusCode.BAD_REQUEST).json({
        //   success: false,
        //   message: "author not found",
        // });
        req.flash("error_msg", "author not found");

        res.redirect("/login-view");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // return res.status(StatusCode.BAD_REQUEST).json({
        //   success: false,
        //   message: "password does not match",
        // });
        req.flash("error_msg", "password does not match");

        res.redirect("/login-view");
      }

      // Generating 32 random bytes (256-bit) and converting to hex
      // const secretKey = crypto.randomBytes(32).toString("hex");

      if (user) {
        // access token
        const accessToken = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15m" },
        );

        // refresh token
        const refreshToken = jwt.sign(
          { id: user._id, name: user.name, email: user.email, role: user.role },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: "7d" },
        );

        // Save refresh token
        user.refreshToken = refreshToken;

        await user.save();

        // return res.status(StatusCode.SUCCESS).json({
        //   success: true,
        //   message: "author login successfull!!",
        //   token: token,
        //   apikey: secretKey,
        // });

        //Cookies
        res.cookie("authorAccessToken", accessToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("authorRefreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        req.flash("success_msg", "You are now logged in to dashboard!");

        res.redirect("/author-dashbaord");

      } else {
        // return res.status(StatusCode.BAD_REQUEST).json({
        //   success: false,
        //   message: "user not found",
        // });
        req.flash("error_msg", "user not found");

        res.redirect("/login-view");
      }
    } catch (error) {

      req.flash("error_msg", error.message);

      res.redirect("/login-view");
    }
  }

  async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Category name is required",
        });
      }

      const exist = await Category.findOne({ name });

      if (exist) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Category already exists",
        });
      }

      const category = await Category.create({
        name,
        description,
      });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Category created",
        data: category,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCategories(req, res) {
    try {
      const data = await Category.find({ isActive: true });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        total: data.length,
        data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;

      const { name, description } = req.body;

      const category = await Category.findByIdAndUpdate(
        categoryId,
        { name, description },
        { new: true },
      );

      if (!category) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Category updated",
        data: category,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;

      if (!categoryId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, id required!",
        });
      }

      const category = await Category.findByIdAndDelete(categoryId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Category deactivated",
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthorController();