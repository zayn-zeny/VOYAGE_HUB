const mapService = require('../services/mapService');
const User = require('../models/User');
const logger = require('../middleware/logger');

// GET /api/maps/geocode
exports.geocode = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });

    const results = await mapService.geocode(q);
    res.json({ results });
  } catch (err) {
    logger.error('Geocode controller error:', err);
    res.status(500).json({ message: 'Geocoding failed' });
  }
};

// GET /api/maps/reverse
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Coordinates required' });

    const result = await mapService.reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json({ result });
  } catch (err) {
    logger.error('Reverse geocode controller error:', err);
    res.status(500).json({ message: 'Reverse geocoding failed' });
  }
};

// GET /api/maps/nearby
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, category, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Coordinates required' });

    const places = await mapService.getNearbyPlaces(
      parseFloat(lat),
      parseFloat(lng),
      category || 'tourism',
      parseInt(radius) || 2000
    );

    res.json({ places });
  } catch (err) {
    logger.error('Nearby places controller error:', err);
    res.status(500).json({ message: 'Nearby places search failed' });
  }
};

// GET /api/maps/route
exports.getRoute = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'From and to coordinates required' });

    const [fromLat, fromLng] = from.split(',').map(Number);
    const [toLat, toLng] = to.split(',').map(Number);

    const route = await mapService.getRoute(fromLat, fromLng, toLat, toLng);
    res.json({ route });
  } catch (err) {
    logger.error('Route controller error:', err);
    res.status(500).json({ message: 'Route calculation failed' });
  }
};

// POST /api/maps/locations
exports.saveLocation = async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Name and coordinates required' });
    }

    const user = await User.findById(req.userId);
    user.savedLocations.push({
      name,
      coordinates: { lat, lng },
    });
    await user.save();

    res.status(201).json({
      message: 'Location saved',
      locations: user.savedLocations,
    });
  } catch (err) {
    logger.error('Save location error:', err);
    res.status(500).json({ message: 'Failed to save location' });
  }
};

// DELETE /api/maps/locations/:locationId
exports.deleteLocation = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.savedLocations = user.savedLocations.filter(
      (loc) => loc._id.toString() !== req.params.locationId
    );
    await user.save();

    res.json({
      message: 'Location removed',
      locations: user.savedLocations,
    });
  } catch (err) {
    logger.error('Delete location error:', err);
    res.status(500).json({ message: 'Failed to delete location' });
  }
};
