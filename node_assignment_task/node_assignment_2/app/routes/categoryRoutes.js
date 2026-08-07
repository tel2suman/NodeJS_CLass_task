const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middlewares/validationMiddleware');

router.use(ensureAuthenticated);

router.get('/', categoryController.listCategories);
router.get('/add', categoryController.addCategoryPage);

router.post('/add', [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').isIn(['category', 'subcategory']).withMessage('Invalid type'),
    validate
], categoryController.addCategory);

router.get('/delete/:id', categoryController.deleteCategory);

module.exports = router;
