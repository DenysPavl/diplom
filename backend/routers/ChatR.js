const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatC');
const authMiddleware = require('../middleware/AuthMiddleware');

router.post('/', authMiddleware, ChatController.sendMessage);

module.exports = router;
