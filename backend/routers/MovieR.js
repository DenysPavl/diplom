const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'Movie info endpoint' });
});

module.exports = router;
