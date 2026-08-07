

const express = require("express");

const categoryController = require("../controllers/CategoryController");

const authChek = require("../middleware/authCheck");

const router = express.Router();

router.post("/create/category", authChek, categoryController.createCategory);

router.get("/view/category", authChek, categoryController.getCategories);

module.exports = router;