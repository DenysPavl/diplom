const express = require('express');
const router = express.Router();

const AuthR = require('./AuthR');
const CommentsR = require('./CommentsR');
const UserR = require('./UserR');
const MovieR = require('./MovieR');
const CategoryR = require('./CategoryR');
const ChatR = require('./ChatR');
const UserController = require('../controllers/UserC');
const authMiddleware = require('../middleware/AuthMiddleware');
const RecommendationsR = require('./RecommendationsR');

router.use('/auth', AuthR);
router.use('/comment', CommentsR);
router.use('/user', UserR);
router.use('/movie', MovieR);
router.use('/category', CategoryR);
router.use('/recommendations', RecommendationsR);
router.use('/chat', ChatR);

// Profile endpoint at root level
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, UserController.updateProfile);

module.exports = router;
