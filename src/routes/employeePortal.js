const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
const { verifyToken } = require('../middleware/authMiddleware');

// Employee portal route
router.get('/', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Welcome to the Employee Portal!' });
});

module.exports = router;
