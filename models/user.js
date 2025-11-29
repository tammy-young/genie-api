'use strict';
import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Filter, {
        foreignKey: 'userId',
        as: 'filters'
      });

      User.hasMany(models.Wish, {
        foreignKey: 'userId',
        as: 'wishes'
      });
    }

    checkPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
  }
  User.init({
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    },
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt();
        user.password = bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt();
          user.password = bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};
