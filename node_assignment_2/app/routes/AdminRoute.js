const express = require("express");

//const authchek = require("../middleware/auth");

const RefreshTokenAuth = require("../middleware/RequireAuth");

const Rolechek = require("../middleware/RoleCheck");

const AdminController = require("../controllers/AdminController");

const router = express.Router();

// register view & create
router.get("/signup/view", AdminController.signupPage);

router.post("/create/signup", AdminController.Signup);

// login view & create
router.get("/login/view", AdminController.loginPage);

router.post("/create/login", AdminController.Login);

router.use(RefreshTokenAuth);

// user dashboard
router.get(
  "/dashboard",
  Rolechek("Admin", "SuperAdmin"),
  AdminController.dashboard,
);


// logout
router.get("/logout", AdminController.Logout);

module.exports = router;