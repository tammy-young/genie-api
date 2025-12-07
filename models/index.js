'use strict';

import path from 'path';
import { Sequelize } from 'sequelize';
import process from 'process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = process.env.NODE_ENV || 'development';
const configFile = readFileSync(path.join(__dirname, '/../config/config.json'), 'utf8');
const config = JSON.parse(configFile)[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, config);
}

// Import User model directly since we know the structure
import userModelDefinition from './user.js';
const UserModel = userModelDefinition(sequelize, Sequelize.DataTypes);
db[UserModel.name] = UserModel;

// Import Filter model
import filterModelDefinition from './filter.js';
const FilterModel = filterModelDefinition(sequelize, Sequelize.DataTypes);
db[FilterModel.name] = FilterModel;

// import wish model
import wishModelDefinition from './wish.js';
const WishModel = wishModelDefinition(sequelize, Sequelize.DataTypes);
db[WishModel.name] = WishModel;

// Import Brand model
import brandModelDefinition from './brand.js';
const BrandModel = brandModelDefinition(sequelize, Sequelize.DataTypes);
db[BrandModel.name] = BrandModel;

// Import Category model
import categoryModelDefinition from './category.js';
const CategoryModel = categoryModelDefinition(sequelize, Sequelize.DataTypes);
db[CategoryModel.name] = CategoryModel;

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
