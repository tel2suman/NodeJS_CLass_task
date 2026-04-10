
const express = require("express");

const router = express.Router();

const authEjsRoute = require('./authEjsRoute');

const adminEjsRoute = require('./adminEjsRoute');

const lookupRoute = require('./lookupRoute');

const employeeRoute = require('./employeeRoute');

router.use(authEjsRoute);

router.use(adminEjsRoute);

router.use(lookupRoute);

router.use(employeeRoute);

module.exports = router