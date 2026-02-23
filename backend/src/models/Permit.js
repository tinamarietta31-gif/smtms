const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Permit extends Model {}

Permit.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    permitNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    permitType: { type: DataTypes.STRING, defaultValue: 'transport' },
    issuedBy: { type: DataTypes.STRING },
    issuedDate: { type: DataTypes.DATE },
    expiryDate: { type: DataTypes.DATE },
    sourceLocation: { type: DataTypes.STRING },
    sourceLatitude: { type: DataTypes.FLOAT },
    sourceLongitude: { type: DataTypes.FLOAT },
    destinationLocation: { type: DataTypes.STRING },
    destinationLatitude: { type: DataTypes.FLOAT },
    destinationLongitude: { type: DataTypes.FLOAT },
    materialType: { type: DataTypes.STRING, defaultValue: 'earth' },
    allowedQuantity: { type: DataTypes.FLOAT },
    allowedTrips: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: { type: DataTypes.STRING, defaultValue: 'active' },
  },
  { sequelize, modelName: 'Permit' }
);

module.exports = Permit;
