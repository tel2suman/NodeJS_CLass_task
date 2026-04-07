
const express = require("express");

const LookupController = require("../controllers/LookupController");

const router = express.Router();


router.post("/category/create", LookupController.CreateCategory);

router.get("/category", LookupController.getCategory);

router.post("/subcategory/create", LookupController.CreateSubCategory);

router.get("/subcategory/with/category", LookupController.CreateSubCategoryWithCategory);

module.exports = router;