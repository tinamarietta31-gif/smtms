const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority',
    required: true
  },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  endLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'PAUSED', 'STOPPED'],
    default: 'ACTIVE'
  },
  quantityLoaded: {
    type: Number,
    default: 0
  },
  quantityUnloaded: {
    type: Number,
    default: 0
  },
  route: [{
    timestamp: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    speed: Number
  }],
  violations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tripSchema.index({ 'startLocation': '2dsphere', 'endLocation': '2dsphere' });

module.exports = mongoose.model('Trip', tripSchema);
