const crypto = require('crypto');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

/**
 * Helper to generate secure random voucher code
 */
function generateVoucherCode(partnerName) {
  const prefix = (partnerName || 'SB').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `SB-${prefix}-${part1}-${part2}`;
}

/**
 * @desc    Get all available rewards
 * @route   GET /api/rewards
 * @access  Public
 */
const getAllRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ active: true }).sort({ costInPoints: 1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Redeem points for a reward
 * @route   POST /api/rewards/:id/redeem
 * @access  Private
 */
const redeemReward = async (req, res, next) => {
  try {
    const rewardId = req.params.id;
    const userId = req.user.id;

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.active) {
      return res.status(404).json({
        success: false,
        message: 'Reward voucher not found or no longer active',
      });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This reward is currently out of stock. Please check back later!',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (user.points < reward.costInPoints) {
      const deficit = reward.costInPoints - user.points;
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You have ${user.points} pts, but this reward costs ${reward.costInPoints} pts (need ${deficit} more pts). Cross more bridges to earn points!`,
        pointsAvailable: user.points,
        pointsRequired: reward.costInPoints,
      });
    }

    // Deduct user points
    user.points -= reward.costInPoints;
    await user.save();

    // Decrement stock
    reward.stock -= 1;
    await reward.save();

    // Generate unique crypto redemption code
    const redemptionCode = generateVoucherCode(reward.partner);

    const redemption = await Redemption.create({
      user: user._id,
      reward: reward._id,
      pointsSpent: reward.costInPoints,
      redemptionCode,
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days valid
    });

    const populatedRedemption = await Redemption.findById(redemption._id).populate('reward');

    res.status(200).json({
      success: true,
      message: `Successfully redeemed "${reward.title}"! Present your voucher code at the partner outlet.`,
      data: {
        redemption: populatedRedemption,
        remainingPoints: user.points,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's redeemed rewards
 * @route   GET /api/rewards/my-redemptions
 * @access  Private
 */
const getMyRedemptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const redemptions = await Redemption.find({ user: userId })
      .populate('reward')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: redemptions.length,
      data: redemptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new reward (Admin only)
 * @route   POST /api/rewards
 * @access  Private/Admin
 */
const createReward = async (req, res, next) => {
  try {
    const { title, description, partner, category, costInPoints, stock, imageUrl, badgeText } = req.body;

    const reward = await Reward.create({
      title,
      description,
      partner,
      category,
      costInPoints: parseInt(costInPoints, 10),
      stock: stock !== undefined ? parseInt(stock, 10) : 100,
      imageUrl,
      badgeText: badgeText || 'Instant Voucher',
    });

    res.status(201).json({
      success: true,
      data: reward,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRewards,
  redeemReward,
  getMyRedemptions,
  createReward,
};
