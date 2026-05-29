const UserService = require('../services/User');

const UserController = {
  async getProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await UserService.getProfile(userId);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await UserService.updateProfile(userId, req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getMovieStatus(req, res) {
    try {
      const { movieId } = req.params;
      const userId = req.userId;
      const status = await UserService.getMovieStatus(userId, movieId);
      res.status(200).json(status);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async addToFavorite(req, res) {
    try {
      const { movieId } = req.body;
      const userId = req.userId;
      await UserService.addToFavorite(userId, movieId);
      res.status(200).json({ message: 'Added to favorites' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async removeFromFavorite(req, res) {
    try {
      const { movieId } = req.body;
      const userId = req.userId;
      await UserService.removeFromFavorite(userId, movieId);
      res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async addToWatched(req, res) {
    try {
      const { movieId } = req.body;
      const userId = req.userId;
      await UserService.addToWatched(userId, movieId);
      res.status(200).json({ message: 'Added to watched' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async removeFromWatched(req, res) {
    try {
      const { movieId } = req.body;
      const userId = req.userId;
      await UserService.removeFromWatched(userId, movieId);
      res.status(200).json({ message: 'Removed from watched' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async addToPlanned(req, res) {
    try {
      const { movieId } = req.body;
      const userId = req.userId;
      await UserService.addToPlanned(userId, movieId);
      res.status(200).json({ message: 'Added to planned' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async removeFromPlanned(req, res) {
    try {
      const { movieId } = req.body;
      const userId = req.userId;
      await UserService.removeFromPlanned(userId, movieId);
      res.status(200).json({ message: 'Removed from planned' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = UserController;
