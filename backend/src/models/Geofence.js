const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Geofence extends Model {}

Geofence.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'authorized' },
    description: { type: DataTypes.TEXT },
    centerLatitude: { type: DataTypes.FLOAT, allowNull: false },
    centerLongitude: { type: DataTypes.FLOAT, allowNull: false },
    radius: { type: DataTypes.FLOAT, defaultValue: 1000 },
    coordinates: { type: DataTypes.TEXT },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    alertOnEntry: { type: DataTypes.BOOLEAN, defaultValue: true },
    alertOnExit: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Geofence' }
);

module.exports = Geofence;
