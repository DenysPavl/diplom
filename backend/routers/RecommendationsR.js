const express = require('express');
const router = express.Router();
const RecommendationsController = require('../controllers/RecommendationsC');
const authMiddleware = require('../middleware/AuthMiddleware');

router.get('/', authMiddleware, RecommendationsController.getRecommendations);

module.exports = router;
