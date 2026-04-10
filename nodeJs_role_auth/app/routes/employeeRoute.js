
const express = require("express");

const EmployeeController = require("../controllers/EmployeeController");

const router = express.Router();

router.post("/create/emp", EmployeeController.createEmp);

// router.get("/emp", EmployeeController.getEmp);

// router.get("/emp/agg", EmployeeController.getEmpagg);

module.exports = router;