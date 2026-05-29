const ChatService = require('../services/Chat');

const ChatController = {
  async sendMessage(req, res) {
    try {
      const { userMessage, conversationHistory } = req.body;

      if (!userMessage || typeof userMessage !== 'string') {
        return res.status(400).json({
          message: 'userMessage is required and must be a string'
        });
      }

      const result = await ChatService.sendMessage(userMessage, conversationHistory || []);

      if (result.error) {
        return res.status(400).json({
          response: result.response,
          movies: result.movies,
          error: result.error
        });
      }

      res.status(200).json({
        response: result.response,
        movies: result.movies
      });
    } catch (error) {
      console.error('Chat controller error:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = ChatController;
