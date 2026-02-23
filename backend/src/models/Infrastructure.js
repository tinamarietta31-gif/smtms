const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Infrastructure extends Model {}

Infrastructure.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['toll_plaza', 'traffic_signal', 'checkpoint', 'weighbridge', 'cctv_junction']],
      },
    },
    latitude: { type: DataTypes.FLOAT, allowNull: false },
    longitude: { type: DataTypes.FLOAT, allowNull: false },
    address: { type: DataTypes.STRING },
    road: { type: DataTypes.STRING },
    zone: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    hasANPR: { type: DataTypes.BOOLEAN, defaultValue: false },
    hasCCTV: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Infrastructure' }
);

module.exports = Infrastructure;
