const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['SUPER_ADMIN', 'OWNER', 'DRIVER'],
    required: true,
    unique: true
  },
  description: String,
  permissions: [{
    type: String,
    enum: [
      'ADD_AUTHORITIES',
      'REMOVE_AUTHORITIES',
      'ADD_MEMBERS',
      'REMOVE_MEMBERS',
      'ADD_VEHICLES',
      'REMOVE_VEHICLES',
      'VIEW_ALL_DATA',
      'MANAGE_ALL_RESOURCES',
      'REMOTE_VEHICLE_CONTROL',
      'CHALLAN_MANAGEMENT',
      'GENERATE_REPORTS',
      'VIEW_OWNED_DATA',
      'ADD_DRIVERS',
      'MONITOR_DRIVERS',
      'VIEW_OWN_DETAILS',
      'VIEW_ASSIGNED_VEHICLE',
      'VIEW_TRIP_DETAILS',
      'VIEW_VIOLATIONS',
      'SUBMIT_REPORTS'
    ]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Role', roleSchema);
