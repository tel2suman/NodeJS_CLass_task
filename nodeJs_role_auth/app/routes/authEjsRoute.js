
const express = require("express");

const AuthEjsController = require("../controllers/AuthEjsController");

const Upload = require("../utils/CloudinaryImageUpload");

const AuthCheck = require("../middleware/authcheck");

const router = express.Router();

// register view & create
router.get("/register/view", AuthEjsController.register);

router.post("/create/register", Upload.single("image"), AuthEjsController.createRegister);

router.get("/verify/otpview", AuthEjsController.VerifyOtpPage);

router.post("/verify/otp", AuthEjsController.verify);

// login view & create
router.get("/login/view", AuthEjsController.login);

router.post("/create/login", AuthEjsController.createLogin);

router.use(AuthCheck);
// user dashboard
router.get("/user/dashboard", AuthEjsController.CheckAuth, AuthEjsController.dashboard);

// logout
router.get("/logout", AuthEjsController.logout);

module.exports = router;
