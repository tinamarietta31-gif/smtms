const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    avatarUrl: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'officer' },
    department: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

module.exports = User;
