const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/leaderboardController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getLeaderboard);

module.exports = router;
