const { generateItinerary, generateSuggestions } = require('../services/geminiService');
const Trip = require('../models/Trip');
const logger = require('../middleware/logger');

// POST /api/ai/generate-itinerary
exports.generateItinerary = async (req, res) => {
  try {
    const { destination, startDate, endDate, travelers, tripType, budget, interests, travelStyle, dietaryRestrictions, coordinates } = req.body;

    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ message: 'Destination, start date, and end date are required' });
    }

    // Calculate duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const preferences = { budget, interests, travelStyle, dietaryRestrictions };

    const itinerary = await generateItinerary({
      destination,
      duration,
      startDate,
      travelers,
      tripType,
      preferences,
    });

    // Calculate estimated total cost
    const estimatedTotal = itinerary.reduce((sum, day) => sum + (day.dailyCost || 0), 0);

    // Create the trip document
    const tripData = {
      userId: req.userId,
      title: `Trip to ${destination}`,
      destination: {
        name: destination,
        coordinates: coordinates || { lat: 0, lng: 0 }
      },
      startDate,
      endDate,
      duration,
      travelers,
      tripType,
      preferences,
      budget: {
        tier: budget || 'mid-range',
        estimated: estimatedTotal,
      },
      itinerary
    };

    const trip = new Trip(tripData);
    trip.updateStatus();
    await trip.save();

    // Emit Socket.IO notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.userId}`).emit('notification', {
        type: 'trip_created',
        message: `Your ${duration}-day itinerary for ${destination} is ready!`,
        timestamp: new Date(),
        tripId: trip._id,
      });
    }

    res.json({
      message: 'Itinerary generated successfully',
      trip,
    });
  } catch (err) {
    logger.error('Generate itinerary error:', err);
    res.status(500).json({ message: err.message || 'Failed to generate itinerary' });
  }
};

// POST /api/ai/optimize-itinerary
exports.optimizeItinerary = async (req, res) => {
  try {
    const { tripId, instructions } = req.body;

    const trip = await Trip.findOne({ _id: tripId, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Regenerate with additional instructions
    const itinerary = await generateItinerary({
      destination: trip.destination.name,
      duration: trip.duration,
      startDate: trip.startDate,
      travelers: trip.travelers,
      tripType: trip.tripType,
      preferences: {
        ...trip.preferences,
        additionalInstructions: instructions,
      },
    });

    trip.itinerary = itinerary;
    trip.budget.estimated = itinerary.reduce((sum, day) => sum + (day.dailyCost || 0), 0);
    await trip.save();

    res.json({
      message: 'Itinerary optimized successfully',
      trip,
    });
  } catch (err) {
    logger.error('Optimize itinerary error:', err);
    res.status(500).json({ message: 'Failed to optimize itinerary' });
  }
};

// GET /api/ai/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { destination } = req.query;

    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    const suggestions = await generateSuggestions(destination);
    res.json({ suggestions });
  } catch (err) {
    logger.error('Get suggestions error:', err);
    res.status(500).json({ message: 'Failed to get suggestions' });
  }
};
