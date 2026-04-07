
const express = require("express");

const InventoryController = require("../controllers/InventoryController");

const router = express.Router();

router.post("/create-product", InventoryController.CreateProduct);

module.exports = router;