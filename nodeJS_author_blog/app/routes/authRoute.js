const express = require("express");

const authController = require("../controllers/authorController");

const tokenCheck = require("../middleware/tokenCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

// register view & create
router.get("/register-view", authController.createAuthorPage);

router.post("/create-author", authController.createAuthor);

router.get("/login-view", authController.loginAuthorPage);

router.post("/login-author", authController.loginAuthor);

router.get("/author-dashbaord", tokenCheck, authController.dashboardPage);

router.post(
  "/create-category",
  tokenCheck,
  Rolechek("admin"),
  authController.createCategory,
);

router.get(
  "/view-category",
  tokenCheck,
  Rolechek("admin"),
  authController.getCategories,
);

router.put(
  "/update-category/:categoryId",
  tokenCheck,
  Rolechek("admin"),
  authController.updateCategory,
);

router.delete(
  "/delete-category/:categoryId",
  tokenCheck,
  Rolechek("admin"),
  authController.deleteCategory,
);


module.exports = router;