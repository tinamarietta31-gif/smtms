const mongoose = require('mongoose');

const challanSchema = new mongoose.Schema({
  challanNumber: {
    type: String,
    unique: true,
    required: true
  },
  violation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation',
    required: true
  },
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
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  paymentDate: Date,
  status: {
    type: String,
    enum: ['ISSUED', 'PAID', 'DISPUTED', 'CANCELLED'],
    default: 'ISSUED'
  },
  reason: String,
  description: String,
  paymentMode: {
    type: String,
    enum: ['CASH', 'ONLINE', 'CHEQUE', 'DD']
  },
  transactionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Challan', challanSchema);
