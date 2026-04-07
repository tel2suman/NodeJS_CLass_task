
const express = require("express");

const AdminAuthEjsController = require("../controllers/AdminAuthEjsController");

const AdminAuthCheck = require("../middleware/adminAuthCheck");

const router = express.Router();


// login view & create
router.get("/admin/login", AdminAuthEjsController.login);

router.post("/admin/login/create", AdminAuthEjsController.loginPost);

router.use(AdminAuthCheck);
// user dashboard
router.get("/admin/dashboard", AdminAuthEjsController.AdminCheckAuth, AdminAuthEjsController.dashboard);

// logout
router.get("/admin/logout", AdminAuthEjsController.adminlogout);


module.exports = router;