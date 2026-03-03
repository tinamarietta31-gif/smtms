const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
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
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  type: {
    type: String,
    enum: ['OVERLOADING', 'SPEEDING', 'ILLEGAL_ROUTE', 'GEOFENCE_BREACH', 'DOCUMENTATION_MISSING', 'OTHER'],
    required: true
  },
  description: String,
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  challan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challan'
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'DISPUTED', 'RESOLVED'],
    default: 'PENDING'
  },
  evidence: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

violationSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Violation', violationSchema);
