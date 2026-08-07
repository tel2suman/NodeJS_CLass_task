const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.get('/profile', protect, UserController.getProfile);
router.put('/profile', protect, upload.single('profilePicture'), UserController.updateProfile);

module.exports = router;
