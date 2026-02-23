const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class GPSLog extends Model {}

GPSLog.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    latitude: { type: DataTypes.FLOAT, allowNull: false },
    longitude: { type: DataTypes.FLOAT, allowNull: false },
    speed: { type: DataTypes.FLOAT, defaultValue: 0 },
    heading: { type: DataTypes.FLOAT },
    altitude: { type: DataTypes.FLOAT },
    accuracy: { type: DataTypes.FLOAT },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    source: { type: DataTypes.STRING, defaultValue: 'gps' },
  },
  { sequelize, modelName: 'GPSLog' }
);

module.exports = GPSLog;
