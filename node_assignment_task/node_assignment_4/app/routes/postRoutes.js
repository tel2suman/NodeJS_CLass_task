const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, PostController.create);
router.put('/:id', protect, PostController.update);
router.delete('/:id', protect, PostController.delete);
router.get('/popular', PostController.listSortedByLikes);

module.exports = router;
