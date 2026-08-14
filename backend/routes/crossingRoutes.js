const express = require('express');
const router = express.Router();
const {
  startCrossing,
  verifyCrossing,
  getActiveCrossing,
  getMyCrossings,
  cancelActiveCrossing,
} = require('../controllers/crossingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All crossing routes require authentication

router.post('/start', startCrossing);
router.post('/verify', verifyCrossing);
router.get('/active', getActiveCrossing);
router.get('/my', getMyCrossings);
router.post('/cancel', cancelActiveCrossing);

module.exports = router;
