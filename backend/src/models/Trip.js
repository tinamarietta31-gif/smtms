const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Trip extends Model {}

Trip.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    permitId: { type: DataTypes.INTEGER },
    tripNumber: { type: DataTypes.STRING },
    sourceLocation: { type: DataTypes.STRING },
    sourceLatitude: { type: DataTypes.FLOAT },
    sourceLongitude: { type: DataTypes.FLOAT },
    destinationLocation: { type: DataTypes.STRING },
    destinationLatitude: { type: DataTypes.FLOAT },
    destinationLongitude: { type: DataTypes.FLOAT },
    materialType: { type: DataTypes.STRING, defaultValue: 'earth' },
    quantity: { type: DataTypes.FLOAT },
    startTime: { type: DataTypes.DATE },
    endTime: { type: DataTypes.DATE },
    expectedDuration: { type: DataTypes.INTEGER },
    actualDuration: { type: DataTypes.INTEGER },
    distance: { type: DataTypes.FLOAT },
    status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
    routeDeviation: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Trip' }
);

module.exports = Trip;
