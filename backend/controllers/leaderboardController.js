const User = require('../models/User');
const Crossing = require('../models/Crossing');

/**
 * @desc    Get top pedestrians on the leaderboard
 * @route   GET /api/leaderboard
 * @access  Public (Personalized ranking if authenticated)
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 15;
    const currentUserId = req.user ? req.user.id : null;

    // Get top users
    const topUsers = await User.find({ role: 'user' })
      .select('name points totalCrossings currentStreak longestStreak createdAt')
      .sort({ points: -1, totalCrossings: -1, currentStreak: -1 })
      .limit(limit);

    // Compute community aggregate stats
    const totalCommunityCrossings = await Crossing.countDocuments({ status: 'verified' });
    const userCount = await User.countDocuments({ role: 'user' });

    let myRank = null;
    let myStats = null;

    if (currentUserId) {
      const currentUser = await User.findById(currentUserId);
      if (currentUser) {
        // Count users with more points or equal points with more crossings
        const aheadCount = await User.countDocuments({
          role: 'user',
          $or: [
            { points: { $gt: currentUser.points } },
            { points: currentUser.points, totalCrossings: { $gt: currentUser.totalCrossings } },
          ],
        });

        myRank = aheadCount + 1;
        myStats = {
          id: currentUser._id,
          name: currentUser.name,
          points: currentUser.points,
          totalCrossings: currentUser.totalCrossings,
          currentStreak: currentUser.currentStreak,
          longestStreak: currentUser.longestStreak,
          rank: myRank,
        };
      }
    }

    // Format top list with explicit rank numbers
    const rankedList = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      points: user.points,
      totalCrossings: user.totalCrossings,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      isCurrentUser: currentUserId && String(user._id) === String(currentUserId),
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedList,
        myStats,
        stats: {
          totalCommunityCrossings,
          totalActivePedestrians: userCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
};
