'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Filter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Filter.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Filter.init({
    name: DataTypes.STRING,
    userId: DataTypes.BIGINT,
    query: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Filter',
    tableName: 'filters',
  });
  return Filter;
};
