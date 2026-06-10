const Trip = require('../models/Trip');
const logger = require('../middleware/logger');

// GET /api/trips
exports.getTrips = async (req, res) => {
  try {
    const { status, sort = '-createdAt', search } = req.query;
    const query = { userId: req.userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'destination.name': { $regex: search, $options: 'i' } },
        { 'destination.country': { $regex: search, $options: 'i' } },
      ];
    }

    const trips = await Trip.find(query).sort(sort).lean();

    // Update statuses based on current date
    const now = new Date();
    const updatedTrips = trips.map((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (trip.status !== 'draft') {
        if (now < start) trip.status = 'upcoming';
        else if (now >= start && now <= end) trip.status = 'ongoing';
        else if (now > end) trip.status = 'completed';
      }
      return trip;
    });

    res.json({ trips: updatedTrips });
  } catch (err) {
    logger.error('Get trips error:', err);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

// POST /api/trips
exports.createTrip = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      userId: req.userId,
    };

    const trip = new Trip(tripData);
    trip.updateStatus();
    await trip.save();

    // Emit notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.userId}`).emit('notification', {
        type: 'trip_created',
        message: `Trip to ${trip.destination.name} created!`,
        tripId: trip._id,
        timestamp: new Date(),
      });
    }

    res.status(201).json({ message: 'Trip created', trip });
  } catch (err) {
    logger.error('Create trip error:', err);
    res.status(500).json({ message: 'Failed to create trip' });
  }
};

// GET /api/trips/:id
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.updateStatus();
    res.json({ trip });
  } catch (err) {
    logger.error('Get trip error:', err);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
};

// PUT /api/trips/:id
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.updateStatus();
    await trip.save();

    res.json({ message: 'Trip updated', trip });
  } catch (err) {
    logger.error('Update trip error:', err);
    res.status(500).json({ message: 'Failed to update trip' });
  }
};

// DELETE /api/trips/:id
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted' });
  } catch (err) {
    logger.error('Delete trip error:', err);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
};

// PUT /api/trips/:id/notes
exports.updateNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { notes } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({ message: 'Notes updated', trip });
  } catch (err) {
    logger.error('Update notes error:', err);
    res.status(500).json({ message: 'Failed to update notes' });
  }
};

// GET /api/trips/stats/summary
exports.getStats = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.userId }).lean();

    const totalTrips = trips.length;
    const totalDays = trips.reduce((sum, t) => sum + (t.duration || 0), 0);

    const countries = new Set(
      trips.map((t) => t.destination?.country).filter(Boolean)
    );

    const savedLocations = req.user?.savedLocations?.length || 0;

    const statusCounts = {
      upcoming: trips.filter((t) => t.status === 'upcoming').length,
      ongoing: trips.filter((t) => t.status === 'ongoing').length,
      completed: trips.filter((t) => t.status === 'completed').length,
      draft: trips.filter((t) => t.status === 'draft').length,
    };

    res.json({
      totalTrips,
      countriesVisited: countries.size,
      totalDays,
      savedLocations,
      statusCounts,
    });
  } catch (err) {
    logger.error('Get stats error:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};
