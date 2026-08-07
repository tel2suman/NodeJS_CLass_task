const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middlewares/validationMiddleware');

router.get('/login', forwardAuthenticated, authController.loginPage);

router.post('/login', [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], authController.login);

router.get('/logout', authController.logout);

module.exports = router;
