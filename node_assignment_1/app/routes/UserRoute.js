const express = require("express");

const UserController = require("../controllers/UserController");

const authChek = require("../middleware/authCheck");

const Upload = require("../utils/CloudinaryImageUpload");

const router = express.Router();

router.post("/create/user", Upload.single("image"), UserController.createUser);

router.post("/verify/user", UserController.verifyUser);

router.post("/login/user", UserController.loginUser);

router.use(authChek);

router.get("/user/profile/:id", UserController.getUserProfile);

router.put("/update/user/profile/:id", Upload.single("image"), UserController.getUpdateProfile);


module.exports = router;