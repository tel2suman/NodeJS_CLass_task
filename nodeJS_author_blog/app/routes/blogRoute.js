
const express = require("express");

const blogController = require("../controllers/blogController");

const Upload = require("../utils/CloudinaryImageUpload");

const router = express.Router();

router.post(
  "/create-blog",
  Upload.single("image"),
  blogController.createBlog,
);

router.get("/all-blogs", blogController.viewAllBlog);

router.get("/author/all/blogs", blogController.viewAllBlogsByAuthor);

router.get("/author/search", blogController.searchBlogsByAuthorName);

module.exports = router;

