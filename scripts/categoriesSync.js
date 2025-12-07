import db from '../models/index.js';
import fetchData from '../utils/fetchData.js';
import readlineSync from 'readline-sync';
import { BAZAAR_URL } from '../api/getBrands.js';

const { Category } = db;

async function syncCategories() {
  try {
    const data = await fetchData(BAZAAR_URL);
    const colours = data.item_colors;
    const fashionItemCategories = data.price_tags.fashion.price_tag;
    const interiorItemCategories = data.price_tags.interior.price_tag;

    const existingColors = await Category.findAll({ where: { type: 'color' } });
    const existingFashionTypes = await Category.findAll({ where: { type: 'fashion' } });
    const existingInteriorTypes = await Category.findAll({ where: { type: 'interior' } });

    const newColors = colours.filter(color =>
      !existingColors.some(existingColor => existingColor.categoryId === color.categoryId)
    );
    const newFashionTypes = fashionItemCategories.filter(category =>
      !existingFashionTypes.some(existingCategory => existingCategory.categoryId === category.categoryId)
    );
    const newInteriorTypes = interiorItemCategories.filter(category =>
      !existingInteriorTypes.some(existingCategory => existingCategory.categoryId === category.categoryId)
    );

    const newCategories = [
      ...newColors.map(color => ({ categoryId: color.categoryId, name: color.name, type: 'color' })),
      ...newFashionTypes.map(category => ({ categoryId: category.categoryId, name: category.name, type: 'fashion' })),
      ...newInteriorTypes.map(category => ({ categoryId: category.categoryId, name: category.name, type: 'interior' }))
    ];

    if (newCategories.length === 0) {
      console.log('No new categories found. Database is up to date.');
      return;
    }

    console.log('New Categories Found:');
    newCategories.forEach(category => {
      console.log(`- ${category.name} (Category ID: ${category.categoryId}, Type: ${category.type})`);
    });

    const userConfirmed = readlineSync.keyInYN('Do you want to add these new categories to the database? ');

    if (userConfirmed) {
      const categoryCreationPromises = newCategories.map(category =>
        Category.create({ categoryId: category.categoryId, name: category.name, type: category.type })
      );

      await Promise.all(categoryCreationPromises);
      console.log(`Successfully added ${newCategories.length} new categories to the database.`);
    } else {
      console.log('Operation cancelled. No changes made to the database.');
    }
  } catch (error) {
    console.error('Error syncing categories:', error);
    throw error;
  }
}

syncCategories();
