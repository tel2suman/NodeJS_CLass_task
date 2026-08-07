const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, CategoryController.create);
router.get('/', CategoryController.listWithStats);

module.exports = router;
