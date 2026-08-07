const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { body } = require('express-validator');
const validate = require('../middlewares/validationMiddleware');

router.use(ensureAuthenticated);
router.use(authorize('Super Admin'));

router.get('/', userController.listUsers);
router.get('/add', userController.addUserPage);

router.post('/add', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('roleId').notEmpty().withMessage('Role is required'),
    validate
], userController.addUser);

router.get('/toggle-status/:id', userController.toggleStatus);
router.get('/delete/:id', userController.deleteUser);

module.exports = router;
