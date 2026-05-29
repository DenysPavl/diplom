const RecommendationService = require('../services/Recommendations');

const RecommendationsController = {
  async getRecommendations(req, res) {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 60);
      const recommendations = await RecommendationService.getRecommendations(req.userId, limit);
      res.status(200).json(recommendations);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = RecommendationsController;
