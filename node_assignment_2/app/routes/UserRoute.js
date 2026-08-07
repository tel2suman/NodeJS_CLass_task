const express = require("express");

const Rolechek = require("../middleware/RoleCheck");

const UserController = require("../controllers/UserController");

const router = express.Router();

// product page
router.get("/add/user", UserController.addUserPage);

// create user
router.post("/create/user", UserController.createUser);

// view user
router.get("/view/user", UserController.viewUser);

// update user (user, manager, admin)
router.post("/update/user/:id", UserController.updateUser);

// delete post
router.get("/delete/user/:id", UserController.deleteUser);


module.exports = router;