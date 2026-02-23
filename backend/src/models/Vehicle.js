const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Vehicle extends Model { }

Vehicle.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    registrationNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    vehicleType: { type: DataTypes.STRING, defaultValue: 'truck' },
    ownerName: { type: DataTypes.STRING, allowNull: false },
    ownerPhone: { type: DataTypes.STRING },
    ownerAddress: { type: DataTypes.TEXT },
    driverName: { type: DataTypes.STRING },
    driverPhone: { type: DataTypes.STRING },
    driverLicense: { type: DataTypes.STRING },
    capacity: { type: DataTypes.FLOAT },
    gpsDeviceId: { type: DataTypes.STRING },
    isGPSActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    status: { type: DataTypes.STRING, defaultValue: 'active' },
    isECMEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    ecmStatus: { type: DataTypes.STRING, defaultValue: 'normal' },
    currentLatitude: { type: DataTypes.FLOAT },
    currentLongitude: { type: DataTypes.FLOAT },
    currentSpeed: { type: DataTypes.FLOAT, defaultValue: 0 },
    lastUpdated: { type: DataTypes.DATE },
  },
  { sequelize, modelName: 'Vehicle' }
);

module.exports = Vehicle;
