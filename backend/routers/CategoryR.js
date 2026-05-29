const express = require('express');
const router = express.Router();

// Stub for category routes (will be implemented if needed)
router.get('/all', (req, res) => {
  res.status(200).json([]);
});

router.post('/create', (req, res) => {
  res.status(200).json('Success');
});

router.delete('/:id', (req, res) => {
  res.status(200).json('Success');
});

module.exports = router;
