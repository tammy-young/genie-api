import 'dotenv/config';
import db from '../models/index.js';

const { Brand, Category } = db;

async function getBrands(onlySellable = false) {

  const colours = await Category.findAll({ where: { type: 'color' } });
  const brands = onlySellable ? await Brand.findAll({ where: { sellable: true } }) : await Brand.findAll();
  const fashionItemCategories = await Category.findAll({ where: { type: 'fashion' } });
  const interiorItemCategories = await Category.findAll({ where: { type: 'interior' } });

  return {
    brands,
    colours,
    fashionItemCategories,
    interiorItemCategories
  };
}

export default getBrands;
