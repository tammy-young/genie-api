'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Wish extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wish.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      // Note: Brand association handled manually in routes due to type mismatch
      // (wish.brand is STRING, brand.brandId is INTEGER)
    }
  }
  Wish.init({
    userId: DataTypes.BIGINT,
    brand: DataTypes.STRING,
    currencyType: DataTypes.DECIMAL,
    name: DataTypes.STRING,
    originalPrice: DataTypes.DECIMAL,
    itemId: DataTypes.DECIMAL,
    sellPrice: DataTypes.DECIMAL,
    sellerId: DataTypes.DECIMAL,
    type: DataTypes.STRING,
    userItemId: DataTypes.DECIMAL,
    sellerUsername: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Wish',
    tableName: 'wishes',
  });
  return Wish;
};
