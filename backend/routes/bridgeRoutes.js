const express = require('express');
const router = express.Router();
const {
  getAllBridges,
  getBridgeById,
  getBridgeQrCodes,
  createBridge,
  reportBridgeIssue,
} = require('../controllers/bridgeController');
const { protect, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getAllBridges);
router.get('/:id', optionalAuth, getBridgeById);
router.get('/:id/qrs', getBridgeQrCodes);
router.post('/:id/report', protect, reportBridgeIssue);
router.post('/', protect, requireAdmin, createBridge);

module.exports = router;
