const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class InfraLog extends Model {}

InfraLog.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    infrastructureId: { type: DataTypes.INTEGER, allowNull: false },
    detectedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    source: { type: DataTypes.STRING, defaultValue: 'anpr' },
    registrationNumber: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING },
    gpsLatitude: { type: DataTypes.FLOAT },
    gpsLongitude: { type: DataTypes.FLOAT },
    gpsMatchStatus: { type: DataTypes.STRING, defaultValue: 'no_data' },
    distanceFromInfra: { type: DataTypes.FLOAT },
    isSuspicious: { type: DataTypes.BOOLEAN, defaultValue: false },
    notes: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: 'InfraLog' }
);

module.exports = InfraLog;
