const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Alert extends Model {}

Alert.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false },
    severity: { type: DataTypes.STRING, defaultValue: 'warning' },
    message: { type: DataTypes.TEXT },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    isResolved: { type: DataTypes.BOOLEAN, defaultValue: false },
    resolvedBy: { type: DataTypes.STRING },
    resolvedAt: { type: DataTypes.DATE },
    notes: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: 'Alert' }
);

module.exports = Alert;
