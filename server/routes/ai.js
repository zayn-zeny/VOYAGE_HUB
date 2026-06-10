const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

// Generate itinerary
router.post(
  '/generate-itinerary',
  auth,
  aiLimiter,
  validate([
    body('destination').notEmpty().withMessage('Destination is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ]),
  aiController.generateItinerary
);

// Optimize existing itinerary
router.post(
  '/optimize-itinerary',
  auth,
  aiLimiter,
  validate([
    body('tripId').notEmpty().withMessage('Trip ID is required'),
    body('instructions').notEmpty().withMessage('Instructions are required'),
  ]),
  aiController.optimizeItinerary
);

// Get suggestions for a destination
router.get('/suggestions', auth, aiController.getSuggestions);

module.exports = router;
