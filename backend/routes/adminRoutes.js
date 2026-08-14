const express = require('express');
const router = express.Router();
const Crossing = require('../models/Crossing');
const User = require('../models/User');
const Bridge = require('../models/Bridge');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect, requireAdmin);

/**
 * @desc    Get admin overview metrics and anti-fraud telemetry
 * @route   GET /api/admin/overview
 * @access  Private/Admin
 */
router.get('/overview', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCrossings = await Crossing.countDocuments();
    const verifiedCrossings = await Crossing.countDocuments({ status: 'verified' });
    const rejectedCrossings = await Crossing.countDocuments({ status: 'rejected' });
    const pendingCrossings = await Crossing.countDocuments({ status: 'pending' });
    const totalBridges = await Bridge.countDocuments();
    const totalRedemptions = await Redemption.countDocuments();

    const recentCrossings = await Crossing.find()
      .populate('user', 'name email')
      .populate('bridge', 'name city pointsPerCrossing')
      .sort({ createdAt: -1 })
      .limit(30);

    const flaggedCrossings = await Crossing.find({
      $or: [{ status: 'rejected' }, { flags: { $exists: true, $not: { $size: 0 } } }],
    })
      .populate('user', 'name email')
      .populate('bridge', 'name city')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalCrossings,
          verifiedCrossings,
          rejectedCrossings,
          pendingCrossings,
          totalBridges,
          totalRedemptions,
          verificationRate: totalCrossings > 0 ? Math.round((verifiedCrossings / totalCrossings) * 100) : 0,
        },
        recentCrossings,
        flaggedCrossings,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
