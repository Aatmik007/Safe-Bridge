const express = require('express');
const router = express.Router();
const {
  getAllRewards,
  redeemReward,
  getMyRedemptions,
  createReward,
} = require('../controllers/rewardController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllRewards);
router.post('/:id/redeem', protect, redeemReward);
router.get('/my-redemptions', protect, getMyRedemptions);
router.post('/', protect, requireAdmin, createReward);

module.exports = router;
