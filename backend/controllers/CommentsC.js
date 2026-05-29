const CommentsService = require('../services/Comments');

const CommentsController = {
  async addComment(req, res) {
    try {
      const { movie, text, rating } = req.body;
      const userId = req.userId;
      const comment = await CommentsService.addComment(userId, movie, text, rating);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getCommentsByMovie(req, res) {
    try {
      const { movieId } = req.params;
      const comments = await CommentsService.getCommentsByMovie(movieId);
      res.status(200).json(comments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.userId;
      await CommentsService.deleteComment(commentId, userId);
      res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = CommentsController;
