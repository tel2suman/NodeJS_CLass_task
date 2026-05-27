
const express = require("express");

const CategoryController = require("../controllers/CategoryController");

const authCheck = require("../middleware/authCheck");

const router = express.Router();

router.use(authCheck);

router.post("/create-category", CategoryController.createCategory);

router.get("/view-category", CategoryController.getCategories);

// Update Product
router.put("/update-category/:id", CategoryController.updateCategory);

// Delete Product
router.delete("/delete-category/:id", CategoryController.deleteCategory);

module.exports = router;