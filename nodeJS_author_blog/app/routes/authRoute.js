const express = require("express");

const authController = require("../controllers/authorController");

const router = express.Router();

router.post("/create-author", authController.createAuthor);

router.post("/login-author", authController.loginAuthor);

module.exports = router;