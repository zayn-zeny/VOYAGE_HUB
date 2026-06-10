const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');

// All routes require auth
router.use(auth);

// Stats must be before :id to avoid conflict
router.get('/stats/summary', tripController.getStats);

// CRUD
router.get('/', tripController.getTrips);
router.post('/', tripController.createTrip);
router.get('/:id', tripController.getTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

// Notes
router.put('/:id/notes', tripController.updateNotes);

module.exports = router;
