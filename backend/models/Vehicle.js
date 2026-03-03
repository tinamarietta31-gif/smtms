const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authority',
    required: true
  },
  type: {
    type: String,
    enum: ['TRUCK', 'DUMPER', 'EXCAVATOR', 'OTHER'],
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  lastLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  isRemoteStopped: {
    type: Boolean,
    default: false
  },
  metadata: {
    manufacturer: String,
    yearOfManufacture: Number,
    insuranceExpiry: Date,
    fitnessCertificateExpiry: Date,
    pollutionCertificateExpiry: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

vehicleSchema.index({ 'lastLocation': '2dsphere' });

module.exports = mongoose.model('Vehicle', vehicleSchema);
