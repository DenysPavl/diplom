const express = require('express');
const router = express.Router();
const CommentsController = require('../controllers/CommentsC');
const authMiddleware = require('../middleware/AuthMiddleware');

router.post('/', authMiddleware, CommentsController.addComment);
router.get('/movie/:movieId', CommentsController.getCommentsByMovie);
router.delete('/:commentId', authMiddleware, CommentsController.deleteComment);

module.exports = router;
