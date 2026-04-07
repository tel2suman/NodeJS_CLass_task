
const express = require("express");

const router = express.Router();

const authEjsRoute = require('./authEjsRoute');

const adminEjsRoute = require('./adminEjsRoute');

const lookupRoute = require('./lookupRoute')

router.use(authEjsRoute);

router.use(adminEjsRoute);

router.use(lookupRoute);

module.exports = router