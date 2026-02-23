const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Violation extends Model { }

Violation.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    tripId: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false },
    severity: { type: DataTypes.STRING, defaultValue: 'medium' },
    description: { type: DataTypes.TEXT },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    evidenceUrl: { type: DataTypes.STRING },
    challanNumber: { type: DataTypes.STRING },
    challanStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
    challanGenerated: { type: DataTypes.BOOLEAN, defaultValue: false },
    challanAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'open' },
    detectedBy: { type: DataTypes.STRING, defaultValue: 'system' },
    resolvedBy: { type: DataTypes.STRING },
    resolvedAt: { type: DataTypes.DATE },
  },
  { sequelize, modelName: 'Violation' }
);

module.exports = Violation;
