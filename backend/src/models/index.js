const sequelize = require('../config/database');

const User = require('./User');
const Vehicle = require('./Vehicle');
const Permit = require('./Permit');
const Trip = require('./Trip');
const Violation = require('./Violation');
const Alert = require('./Alert');
const Geofence = require('./Geofence');
const GPSLog = require('./GPSLog');
const Infrastructure = require('./Infrastructure');
const InfraLog = require('./InfraLog');

// Associations
Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'trips' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Permit.hasMany(Trip, { foreignKey: 'permitId', as: 'trips' });
Trip.belongsTo(Permit, { foreignKey: 'permitId', as: 'permit' });

Vehicle.hasMany(Permit, { foreignKey: 'vehicleId', as: 'permits' });
Permit.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(Violation, { foreignKey: 'vehicleId', as: 'violations' });
Violation.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Trip.hasMany(Violation, { foreignKey: 'tripId', as: 'violations' });
Violation.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });

Vehicle.hasMany(Alert, { foreignKey: 'vehicleId', as: 'alerts' });
Alert.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(GPSLog, { foreignKey: 'vehicleId', as: 'gpsLogs' });
GPSLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Vehicle.hasMany(InfraLog, { foreignKey: 'vehicleId', as: 'infraLogs' });
InfraLog.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

Infrastructure.hasMany(InfraLog, { foreignKey: 'infrastructureId', as: 'logs' });
InfraLog.belongsTo(Infrastructure, { foreignKey: 'infrastructureId', as: 'infrastructure' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Permit,
  Trip,
  Violation,
  Alert,
  Geofence,
  GPSLog,
  Infrastructure,
  InfraLog,
};
