const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  category: {
    type: String,
    enum: ['food', 'attraction', 'transport', 'accommodation', 'activity'],
    default: 'activity',
  },
  estimatedCost: { type: Number, default: 0 },
  duration: { type: String, default: '' },
  tips: { type: String, default: '' },
}, { _id: true });

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: String, default: '' },
  title: { type: String, default: '' },
  activities: [activitySchema],
  dailyCost: { type: Number, default: 0 },
}, { _id: true });

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    destination: {
      name: { type: String, required: true },
      country: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    travelers: { type: Number, default: 1, min: 1 },
    tripType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group'],
      default: 'solo',
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    budget: {
      tier: {
        type: String,
        enum: ['backpacker', 'budget', 'mid-range', 'luxury'],
        default: 'mid-range',
      },
      estimated: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    itinerary: [daySchema],
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update status based on dates
tripSchema.methods.updateStatus = function () {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (now < start) {
    this.status = 'upcoming';
  } else if (now >= start && now <= end) {
    this.status = 'ongoing';
  } else if (now > end) {
    this.status = 'completed';
  }

  return this.status;
};

// Virtual for total estimated cost
tripSchema.virtual('totalCost').get(function () {
  if (!this.itinerary || this.itinerary.length === 0) return 0;
  return this.itinerary.reduce((sum, day) => sum + (day.dailyCost || 0), 0);
});

// Ensure virtuals are included in JSON
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

// Index for efficient queries
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ userId: 1, startDate: -1 });

module.exports = mongoose.model('Trip', tripSchema);
