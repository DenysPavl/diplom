const AuthService = require('../services/Auth');

const AuthController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const { user, token } = await AuthService.register(username, email, password);
      res.status(201).json({ token, data: user, message: 'Registration successful' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      res.status(200).json({
        token,
        data: user,
        message: 'Successful login ;)'
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = AuthController;
