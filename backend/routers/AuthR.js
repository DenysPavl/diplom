const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthC');

router.post('/login', AuthController.login);
router.post('/registration', AuthController.register);

module.exports = router;
