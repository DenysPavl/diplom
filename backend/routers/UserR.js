const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserC');
const authMiddleware = require('../middleware/AuthMiddleware');

router.get('/status/:movieId', authMiddleware, UserController.getMovieStatus);

router.post('/favorite', authMiddleware, UserController.addToFavorite);
router.delete('/favorite', authMiddleware, UserController.removeFromFavorite);

router.post('/watched', authMiddleware, UserController.addToWatched);
router.delete('/watched', authMiddleware, UserController.removeFromWatched);

router.post('/planned', authMiddleware, UserController.addToPlanned);
router.delete('/planned', authMiddleware, UserController.removeFromPlanned);

module.exports = router;
