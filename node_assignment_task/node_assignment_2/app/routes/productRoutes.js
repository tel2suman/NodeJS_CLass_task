const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { body } = require('express-validator');
const validate = require('../middlewares/validationMiddleware');

router.use(ensureAuthenticated);

router.get('/', productController.listProducts);
router.get('/add', productController.addProductPage);

router.post('/add', 
    upload.single('productImage'),
    [
        body('name').notEmpty().withMessage('Product name is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('categoryId').notEmpty().withMessage('Category is required'),
        body('subcategoryId').notEmpty().withMessage('Subcategory is required'),
        validate
    ], 
    productController.addProduct
);

router.get('/delete/:id', productController.deleteProduct);

module.exports = router;
