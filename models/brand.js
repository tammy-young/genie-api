'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      // define association here
      Brand.hasMany(models.Wish, {
        foreignKey: 'brand',
        sourceKey: 'brandId',
        as: 'wishes'
      });
    }
  }
  Brand.init({
    name: DataTypes.STRING,
    brandId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    sellable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Brand',
    tableName: 'brands'
  });
  return Brand;
};
