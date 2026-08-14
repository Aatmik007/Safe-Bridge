const Crossing = require('../models/Crossing');
const Bridge = require('../models/Bridge');
const User = require('../models/User');
const { verifyQrToken } = require('../utils/tokenUtils');
const { calculateHaversineDistance, checkGpsProximity } = require('../utils/geoUtils');

const COOLDOWN_HOURS = parseFloat(process.env.COOLDOWN_HOURS) || 6;
const MIN_CROSSING_SECONDS = parseInt(process.env.MIN_CROSSING_SECONDS, 10) || 12;
const MAX_CROSSING_SECONDS = parseInt(process.env.MAX_CROSSING_SECONDS, 10) || 180;
const DAILY_CROSSING_CAP = parseInt(process.env.DAILY_CROSSING_CAP, 10) || 4;

/**
 * Helper to check calendar day difference for streak calculation
 */
function getDayDifference(date1, date2) {
  if (!date1 || !date2) return null;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * @desc    Start a bridge crossing (Entry QR Scanned)
 * @route   POST /api/crossings/start
 * @access  Private
 */
const startCrossing = async (req, res, next) => {
  try {
    const { bridgeId, token, location } = req.body;
    const userId = req.user.id;

    if (!bridgeId) {
      return res.status(400).json({
        success: false,
        message: 'Bridge ID is required to initiate crossing',
      });
    }

    const bridge = await Bridge.findById(bridgeId);
    if (!bridge || !bridge.active) {
      return res.status(404).json({
        success: false,
        message: 'Bridge not found or currently inactive',
      });
    }

    // 1. Anti-Fraud: Validate QR Token integrity & expiry
    const tokenCheck = verifyQrToken(bridge._id, 'entry', token);
    if (!tokenCheck.valid) {
      return res.status(400).json({
        success: false,
        message: tokenCheck.reason || 'Invalid or expired entry QR token',
      });
    }

    // 2. Anti-Fraud: Check for duplicate pending crossing on this bridge
    const existingPending = await Crossing.findOne({
      user: userId,
      bridge: bridge._id,
      status: 'pending',
    }).populate('bridge');

    if (existingPending) {
      const elapsedSeconds = Math.round((Date.now() - new Date(existingPending.entryTimestamp).getTime()) / 1000);
      
      // If the pending crossing is within valid session window, resume it
      if (elapsedSeconds <= MAX_CROSSING_SECONDS) {
        return res.status(200).json({
          success: true,
          resumed: true,
          message: `Resumed active crossing on ${bridge.name}. Proceed to the exit stairs to scan and earn points!`,
          data: {
            crossing: existingPending,
            elapsedSeconds,
            minCrossingSeconds: MIN_CROSSING_SECONDS,
            maxCrossingSeconds: MAX_CROSSING_SECONDS,
          },
        });
      } else {
        // Expired pending crossing: mark as rejected due to timeout
        existingPending.status = 'rejected';
        existingPending.rejectionReason = `Session expired (${elapsedSeconds}s > max ${MAX_CROSSING_SECONDS}s)`;
        await existingPending.save();
      }
    }

    // 3. Anti-Fraud: Enforce strictly derived per-bridge 6-hour cooldown from Crossing history
    const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
    const cooldownThresholdDate = new Date(Date.now() - cooldownMs);

    const recentVerifiedCrossing = await Crossing.findOne({
      user: userId,
      bridge: bridge._id,
      status: 'verified',
      exitTimestamp: { $gte: cooldownThresholdDate },
    }).sort({ exitTimestamp: -1 });

    if (recentVerifiedCrossing && recentVerifiedCrossing.exitTimestamp) {
      const timeSinceExitMs = Date.now() - new Date(recentVerifiedCrossing.exitTimestamp).getTime();
      const remainingMs = cooldownMs - timeSinceExitMs;
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

      const timeFormatted = remainingHours > 0 
        ? `${remainingHours}h ${remainingMins}m` 
        : `${remainingMins} minutes`;

      return res.status(400).json({
        success: false,
        isCooldown: true,
        cooldownRemainingMs: remainingMs,
        message: `Cooldown active: You crossed ${bridge.name} recently. To prevent farming, please try again in ${timeFormatted}.`,
      });
    }

    // Clean up any stray pending crossings on OTHER bridges that have timed out
    await Crossing.updateMany(
      {
        user: userId,
        status: 'pending',
        bridge: { $ne: bridge._id },
      },
      {
        $set: {
          status: 'rejected',
          rejectionReason: 'Superceded by starting crossing on another bridge',
        },
      }
    );

    // 4. Record soft GPS telemetry & proximity check
    let geoDistance = null;
    const flags = [];

    if (location && location.lat && location.lng) {
      const proximity = checkGpsProximity(location.lat, location.lng, bridge.latitude, bridge.longitude);
      geoDistance = proximity.distanceMeters;
      if (!proximity.inRadius) {
        flags.push(`ENTRY_GPS_FAR_${geoDistance}M`);
      }
      if (location.accuracy && location.accuracy > 80) {
        flags.push('ENTRY_GPS_ACCURACY_LOW');
      }
    } else {
      flags.push('ENTRY_GPS_OMITTED');
    }

    // 5. Create new pending crossing
    const newCrossing = await Crossing.create({
      user: userId,
      bridge: bridge._id,
      entryTimestamp: new Date(),
      entryLocation: location ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy } : null,
      status: 'pending',
      geoDistanceDelta: geoDistance,
      flags,
    });

    const populatedCrossing = await Crossing.findById(newCrossing._id).populate('bridge');

    res.status(201).json({
      success: true,
      message: `Crossing initiated on ${bridge.name}! Walk across the bridge and scan the Exit QR at the opposite stairs.`,
      data: {
        crossing: populatedCrossing,
        minCrossingSeconds: MIN_CROSSING_SECONDS,
        maxCrossingSeconds: MAX_CROSSING_SECONDS,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify and complete a bridge crossing (Exit QR Scanned)
 * @route   POST /api/crossings/verify
 * @access  Private
 */
const verifyCrossing = async (req, res, next) => {
  try {
    const { bridgeId, token, location } = req.body;
    const userId = req.user.id;

    if (!bridgeId) {
      return res.status(400).json({
        success: false,
        message: 'Bridge ID is required for exit verification',
      });
    }

    const bridge = await Bridge.findById(bridgeId);
    if (!bridge || !bridge.active) {
      return res.status(404).json({
        success: false,
        message: 'Bridge not found or currently inactive',
      });
    }

    // 1. Anti-Fraud: Validate Exit QR Token
    const tokenCheck = verifyQrToken(bridge._id, 'exit', token);
    if (!tokenCheck.valid) {
      return res.status(400).json({
        success: false,
        message: tokenCheck.reason || 'Invalid or expired exit QR token',
      });
    }

    // 2. Anti-Fraud: Find user's active pending crossing for this bridge
    const pendingCrossing = await Crossing.findOne({
      user: userId,
      bridge: bridge._id,
      status: 'pending',
    }).sort({ entryTimestamp: -1 });

    if (!pendingCrossing) {
      return res.status(400).json({
        success: false,
        message: 'No active crossing found for this bridge. You must scan the Entry QR code at the start stairs first before scanning the exit!',
      });
    }

    const now = new Date();
    const entryTime = new Date(pendingCrossing.entryTimestamp).getTime();
    const durationSeconds = Math.round((now.getTime() - entryTime) / 1000);

    pendingCrossing.exitTimestamp = now;
    pendingCrossing.durationSeconds = durationSeconds;
    pendingCrossing.exitLocation = location ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy } : null;

    // 3. Anti-Fraud: Climb Duration Minimum Check (< 12s)
    if (durationSeconds < MIN_CROSSING_SECONDS) {
      pendingCrossing.status = 'rejected';
      pendingCrossing.rejectionReason = `Crossing completed in ${durationSeconds}s, which is below the minimum realistic climb duration of ${MIN_CROSSING_SECONDS}s. Anti-fraud check failed.`;
      await pendingCrossing.save();

      return res.status(400).json({
        success: false,
        rejectionReason: pendingCrossing.rejectionReason,
        durationSeconds,
        minRequiredSeconds: MIN_CROSSING_SECONDS,
        message: `Too fast! ${durationSeconds} seconds is not enough to climb and cross the bridge. Minimum required time is ${MIN_CROSSING_SECONDS}s.`,
      });
    }

    // 4. Anti-Fraud: Session Maximum Duration Check (> 180s)
    if (durationSeconds > MAX_CROSSING_SECONDS) {
      pendingCrossing.status = 'rejected';
      pendingCrossing.rejectionReason = `Crossing duration of ${durationSeconds}s exceeded the maximum session window of ${MAX_CROSSING_SECONDS}s.`;
      await pendingCrossing.save();

      return res.status(400).json({
        success: false,
        rejectionReason: pendingCrossing.rejectionReason,
        durationSeconds,
        maxAllowedSeconds: MAX_CROSSING_SECONDS,
        message: `Session timed out (${durationSeconds}s elapsed). Please start a new crossing when you are at the bridge.`,
      });
    }

    // 5. Anti-Fraud: Soft GPS Proximity Check (Haversine formula)
    let exitDistance = null;
    if (location && location.lat && location.lng) {
      const exitProximity = checkGpsProximity(location.lat, location.lng, bridge.latitude, bridge.longitude);
      exitDistance = exitProximity.distanceMeters;
      if (!exitProximity.inRadius) {
        pendingCrossing.flags.push(`EXIT_GPS_FAR_${exitDistance}M`);
      }
    } else {
      pendingCrossing.flags.push('EXIT_GPS_OMITTED');
    }

    // 6. Optional Anti-Fraud: Soft Daily Crossing Cap Check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const verifiedTodayCount = await Crossing.countDocuments({
      user: userId,
      status: 'verified',
      exitTimestamp: { $gte: startOfToday },
    });

    let pointsToAward = bridge.pointsPerCrossing || 25;
    let dailyCapHit = false;

    if (DAILY_CROSSING_CAP > 0 && verifiedTodayCount >= DAILY_CROSSING_CAP) {
      dailyCapHit = true;
      pendingCrossing.flags.push(`DAILY_CAP_REACHED_${DAILY_CROSSING_CAP}`);
      // As a pedestrian-friendly policy, we still verify the crossing to maintain streak, but cap bonus points
      pointsToAward = 5; // Nominal pedestrian safety bonus
    }

    // 7. Calculate User Streak
    const user = await User.findById(userId);
    const dayDiff = getDayDifference(user.lastCrossingDate, now);

    let newStreak = user.currentStreak || 0;
    if (dayDiff === null) {
      // First ever crossing
      newStreak = 1;
    } else if (dayDiff === 0) {
      // Multiple crossings on the same day: keep current streak intact
      newStreak = user.currentStreak || 1;
    } else if (dayDiff === 1) {
      // Consecutive calendar day: increment streak!
      newStreak = (user.currentStreak || 0) + 1;
    } else {
      // Missed one or more days: reset to 1
      newStreak = 1;
    }

    const longestStreak = Math.max(user.longestStreak || 0, newStreak);

    // 8. Atomically update User points and stats
    user.points = (user.points || 0) + pointsToAward;
    user.totalCrossings = (user.totalCrossings || 0) + 1;
    user.currentStreak = newStreak;
    user.longestStreak = longestStreak;
    user.lastCrossingDate = now;
    await user.save();

    // 9. Finalize Crossing
    pendingCrossing.status = 'verified';
    pendingCrossing.pointsAwarded = pointsToAward;
    pendingCrossing.geoDistanceDelta = exitDistance;
    await pendingCrossing.save();

    const populatedCrossing = await Crossing.findById(pendingCrossing._id).populate('bridge');

    res.status(200).json({
      success: true,
      message: `Verified! You earned +${pointsToAward} points for safely using ${bridge.name}!`,
      data: {
        crossing: populatedCrossing,
        pointsAwarded: pointsToAward,
        totalPoints: user.points,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalCrossings: user.totalCrossings,
        dailyCapHit,
        dailyCrossingsCompleted: verifiedTodayCount + 1,
        dailyCap: DAILY_CROSSING_CAP,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's current pending crossing (if any)
 * @route   GET /api/crossings/active
 * @access  Private
 */
const getActiveCrossing = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const activeCrossing = await Crossing.findOne({
      user: userId,
      status: 'pending',
    }).populate('bridge');

    if (!activeCrossing) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const elapsedSeconds = Math.round((Date.now() - new Date(activeCrossing.entryTimestamp).getTime()) / 1000);

    // If active crossing has exceeded MAX_CROSSING_SECONDS, auto-expire it
    if (elapsedSeconds > MAX_CROSSING_SECONDS) {
      activeCrossing.status = 'rejected';
      activeCrossing.rejectionReason = `Session expired (${elapsedSeconds}s > ${MAX_CROSSING_SECONDS}s)`;
      await activeCrossing.save();

      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        crossing: activeCrossing,
        elapsedSeconds,
        remainingSeconds: Math.max(0, MAX_CROSSING_SECONDS - elapsedSeconds),
        minCrossingSeconds: MIN_CROSSING_SECONDS,
        maxCrossingSeconds: MAX_CROSSING_SECONDS,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's crossing history
 * @route   GET /api/crossings/my
 * @access  Private
 */
const getMyCrossings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Crossing.countDocuments({ user: userId });
    const crossings = await Crossing.find({ user: userId })
      .populate('bridge')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        crossings,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an active pending crossing
 * @route   POST /api/crossings/cancel
 * @access  Private
 */
const cancelActiveCrossing = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const active = await Crossing.findOne({ user: userId, status: 'pending' });

    if (active) {
      active.status = 'rejected';
      active.rejectionReason = 'Cancelled by user';
      await active.save();
    }

    res.status(200).json({
      success: true,
      message: 'Active crossing session cancelled.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startCrossing,
  verifyCrossing,
  getActiveCrossing,
  getMyCrossings,
  cancelActiveCrossing,
};
