const express = require("express");

const blogController = require("../controllers/blogController");

const Upload = require("../utils/CloudinaryImageUpload");

const authCheck = require("../middleware/auth");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();


// router.post(
//   "/create-blog", authCheck,
//   Rolechek("author","admin"),
//   Upload.single("image"),
//   blogController.createBlog,
// );

// router.get(
//   "/view/all-blogs",
//   authCheck,
//   Rolechek("author","admin"),
//   blogController.viewAllBlog,
// );

// router.put(
//   "/update/blog/:blogId",
//   authCheck,
//   Rolechek("author","admin"),
//   Upload.single("image"), // multer
//   blogController.updateBlog,
// );

// router.delete(
//   "/delete/blog/:blogId",
//   authCheck,
//   Rolechek("author","admin"),
//   blogController.deleteBlog,
// );

// single endpoint blog crud route

router.all(
  "/blog", authCheck,
  Rolechek("author", "admin"),
  Upload.single("image"),
  blogController.blogOperations,
);

router.all(
  "/blog/:blogId", authCheck,
  Rolechek("author", "admin"),
  Upload.single("image"), // multer
  blogController.blogOperations,
);

// end of single endpoint

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
  Rolechek("user"),
  blogController.addComment,
);

router.get(
  "/comment/blog/:blogId",
  authCheck,
  Rolechek("user"),
  blogController.getCommentsByBlog,
);

router.post(
  "/like/add",
  authCheck,
  Rolechek("user"),
  blogController.toggleLike,
);

router.get(
  "/all/like",
  authCheck,
  Rolechek("user"),
  blogController.getLikesCountByBlog,
);

router.put("/blog/approve/:blogId", authCheck, Rolechek("admin"), blogController.approveBlog);

router.put("/blog/reject/:blogId", authCheck, Rolechek("admin"), blogController.rejectBlog);

router.get("/blog/by/category", authCheck, Rolechek("admin"), blogController.getBlogsByCategory);

router.get("/all/published/blogs", authCheck, Rolechek("user"), blogController.getApprovedBlogs)


module.exports = router;

