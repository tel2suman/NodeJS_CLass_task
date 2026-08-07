const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.post('/signup', AuthController.signup);
router.get('/verify/:token', AuthController.verifyEmail);
router.post('/login', AuthController.login);

module.exports = router;
