const express = require("express");

const blogController = require("../controllers/blogController");

const Upload = require("../utils/CloudinaryImageUpload");

const authCheck = require("../middleware/auth");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();


router.post(
  "/create-blog", authCheck,
  Rolechek("author","admin"),
  Upload.single("image"),
  blogController.createBlog,
);

router.get(
  "/view/all-blogs",
  authCheck,
  Rolechek("author","admin"),
  blogController.viewAllBlog,
);

router.put(
  "/update/blog/:blogId",
  authCheck,
  Rolechek("author","admin"),
  Upload.single("image"), // multer
  blogController.updateBlog,
);

router.delete(
  "/delete/blog/:blogId",
  authCheck,
  Rolechek("author","admin"),
  blogController.deleteBlog,
);

router.get(
  "/author/all/blogs",
  authCheck,
  Rolechek("author","admin"),
  blogController.viewAllBlogsByAuthor,
);

router.get(
  "/author/search",
  authCheck,
  Rolechek("author","admin"),
  blogController.searchBlogsByAuthorName,
);

router.post(
  "/comment/add",
  authCheck,
  Rolechek("author","admin"),
  blogController.addComment,
);

router.get(
  "/comment/blog/:blogId",
  authCheck,
  Rolechek("author","admin"),
  blogController.getCommentsByBlog,
);

router.post(
  "/like/add",
  authCheck,
  Rolechek("author","admin"),
  blogController.toggleLike,
);

router.get(
  "/all/like",
  authCheck,
  Rolechek("author","admin"),
  blogController.getLikesCountByBlog,
);

module.exports = router;

