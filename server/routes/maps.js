const express = require('express');
const router = express.Router();
const mapsController = require('../controllers/mapsController');
const auth = require('../middleware/auth');

// Public geocoding (no auth needed for autocomplete UX)
router.get('/geocode', mapsController.geocode);
router.get('/reverse', mapsController.reverseGeocode);

// Require auth for other map features
router.get('/nearby', auth, mapsController.getNearby);
router.get('/route', auth, mapsController.getRoute);
router.post('/locations', auth, mapsController.saveLocation);
router.delete('/locations/:locationId', auth, mapsController.deleteLocation);

module.exports = router;
