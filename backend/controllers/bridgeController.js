const Bridge = require('../models/Bridge');
const Crossing = require('../models/Crossing');
const { generateBridgeQrSet, generateQrDataUrl } = require('../utils/qrGenerator');
const { generateSignedQrToken } = require('../utils/tokenUtils');

const COOLDOWN_HOURS = parseFloat(process.env.COOLDOWN_HOURS) || 6;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Helper to compute cooldown details for a given bridge and user from Crossing history
 */
async function computeUserBridgeCooldown(bridgeId, userId) {
  if (!userId) {
    return {
      isAvailable: true,
      cooldownRemainingMs: 0,
      cooldownRemainingMinutes: 0,
      cooldownExpiresAt: null,
      lastVerifiedCrossing: null,
    };
  }

  const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
  const cooldownThreshold = new Date(Date.now() - cooldownMs);

  const lastVerified = await Crossing.findOne({
    user: userId,
    bridge: bridgeId,
    status: 'verified',
  }).sort({ exitTimestamp: -1 });

  if (!lastVerified || !lastVerified.exitTimestamp) {
    return {
      isAvailable: true,
      cooldownRemainingMs: 0,
      cooldownRemainingMinutes: 0,
      cooldownExpiresAt: null,
      lastVerifiedCrossing: null,
    };
  }

  const elapsedMs = Date.now() - new Date(lastVerified.exitTimestamp).getTime();
  if (elapsedMs < cooldownMs) {
    const remainingMs = cooldownMs - elapsedMs;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    const expiresAt = new Date(new Date(lastVerified.exitTimestamp).getTime() + cooldownMs);

    return {
      isAvailable: false,
      cooldownRemainingMs: remainingMs,
      cooldownRemainingMinutes: remainingMinutes,
      cooldownExpiresAt: expiresAt,
      lastVerifiedCrossing: lastVerified.exitTimestamp,
      formattedRemaining: remainingMinutes >= 60 
        ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m` 
        : `${remainingMinutes}m`,
    };
  }

  return {
    isAvailable: true,
    cooldownRemainingMs: 0,
    cooldownRemainingMinutes: 0,
    cooldownExpiresAt: null,
    lastVerifiedCrossing: lastVerified.exitTimestamp,
  };
}

/**
 * @desc    Get all active bridges with per-user cooldown status
 * @route   GET /api/bridges
 * @access  Public (Personalized if JWT token sent)
 */
const getAllBridges = async (req, res, next) => {
  try {
    const bridges = await Bridge.find({ active: true }).sort({ name: 1 });
    const userId = req.user ? req.user.id : null;

    // Attach dynamic cooldown metrics derived on the fly from Crossing history
    const bridgesWithCooldown = await Promise.all(
      bridges.map(async (bridge) => {
        const cooldown = await computeUserBridgeCooldown(bridge._id, userId);
        return {
          ...bridge.toObject(),
          cooldown,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: bridgesWithCooldown.length,
      data: bridgesWithCooldown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single bridge by ID with QR and cooldown details
 * @route   GET /api/bridges/:id
 * @access  Public (Personalized if JWT token sent)
 */
const getBridgeById = async (req, res, next) => {
  try {
    const bridge = await Bridge.findById(req.params.id);
    if (!bridge) {
      return res.status(404).json({
        success: false,
        message: 'Bridge not found',
      });
    }

    const userId = req.user ? req.user.id : null;
    const cooldown = await computeUserBridgeCooldown(bridge._id, userId);

    // If QR codes aren't stored yet, generate on the fly
    let qrCodes = bridge.qrCodes;
    if (!qrCodes || !qrCodes.entryQrDataUrl) {
      qrCodes = await generateBridgeQrSet(CLIENT_URL, bridge._id);
      bridge.qrCodes = qrCodes;
      await bridge.save();
    }

    res.status(200).json({
      success: true,
      data: {
        ...bridge.toObject(),
        cooldown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate fresh scannable QR codes for a bridge
 * @route   GET /api/bridges/:id/qrs
 * @access  Public
 */
const getBridgeQrCodes = async (req, res, next) => {
  try {
    const bridge = await Bridge.findById(req.params.id);
    if (!bridge) {
      return res.status(404).json({
        success: false,
        message: 'Bridge not found',
      });
    }

    const qrSet = await generateBridgeQrSet(CLIENT_URL, bridge._id);

    res.status(200).json({
      success: true,
      data: {
        bridgeId: bridge._id,
        bridgeName: bridge.name,
        ...qrSet,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new bridge (Admin only)
 * @route   POST /api/bridges
 * @access  Private/Admin
 */
const createBridge = async (req, res, next) => {
  try {
    const { name, locationLabel, city, latitude, longitude, pointsPerCrossing, description } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const entryCode = `fob-${slug}-entry-${Date.now().toString(36)}`;
    const exitCode = `fob-${slug}-exit-${Date.now().toString(36)}`;

    const newBridge = await Bridge.create({
      name,
      locationLabel,
      city: city || 'Mumbai',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pointsPerCrossing: pointsPerCrossing ? parseInt(pointsPerCrossing, 10) : 25,
      entryCode,
      exitCode,
      description,
    });

    const qrSet = await generateBridgeQrSet(CLIENT_URL, newBridge._id);
    newBridge.qrCodes = qrSet;
    await newBridge.save();

    res.status(201).json({
      success: true,
      message: 'Bridge created with generated QR codes',
      data: newBridge,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report bridge maintenance or safety hazard (Citizen Reporting)
 * @route   POST /api/bridges/:id/report
 * @access  Private
 */
const reportBridgeIssue = async (req, res, next) => {
  try {
    const { issueType, note } = req.body;
    const bridge = await Bridge.findById(req.params.id);

    if (!bridge) {
      return res.status(404).json({
        success: false,
        message: 'Bridge not found',
      });
    }

    bridge.maintenanceReports.push({
      user: req.user.id,
      issueType: issueType || 'Lighting',
      note: note || 'Issue reported via Citizen Safety Tool',
      reportedAt: new Date(),
    });

    await bridge.save();

    res.status(200).json({
      success: true,
      message: 'Thank you! Your safety maintenance report has been logged with municipal transport ops.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBridges,
  getBridgeById,
  getBridgeQrCodes,
  createBridge,
  reportBridgeIssue,
};
