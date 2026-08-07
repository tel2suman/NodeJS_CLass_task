const express = require("express");

const ProductController = require("../controllers/ProductController");

const router = express.Router();

router.post("/product/create", ProductController.createProduct);

router.get("/product", ProductController.getProduct);

module.exports = router;