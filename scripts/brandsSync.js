import fetchData from "../utils/fetchData.js";
import { BAZAAR_URL } from "../api/search.js";
import db from "../models/index.js";
import readlineSync from 'readline-sync';
import fs from 'fs';

const { Brand } = db;

async function syncBrands() {
  try {

    const data = await fetchData(BAZAAR_URL);
    const brands = data.brands.fashion.brand.concat(data.brands.interior.brand);
    const relevantBrandData = brands.map(brand => ({ name: brand.name, brandId: brand.id }));
    const existingBrands = await Brand.findAll();

    const newBrands = relevantBrandData.filter(brand =>
      !existingBrands.some(existingBrand => existingBrand.brandId === brand.brandId)
    );

    if (newBrands.length === 0) {
      console.log('No new brands found. Database is up to date.');
      return;
    }

    console.log('New Brands Found:');
    newBrands.forEach(brand => {
      console.log(`- ${brand.name} (Brand ID: ${brand.brandId})`);
    });

    const userConfirmed = readlineSync.keyInYN('Do you want to add these new brands to the database? ');

    if (userConfirmed) {
      const brandCreationPromises = newBrands.map(brand =>
        Brand.create({ brandId: brand.brandId, name: brand.name })
      );

      await Promise.all(brandCreationPromises);
      console.log(`Successfully added ${newBrands.length} new brands to the database.`);
    } else {
      console.log('Operation cancelled. No changes made to the database.');
    }
  } catch (error) {
    console.error('Error syncing brands:', error);
    throw error;
  }
}

async function updateSellable() {
  const method = readlineSync.question('Choose method: (1) Single Brand by ID, (2) Multiple Brands from Unsellable Brands File: ');

  if (method === '1') {
    await updateSingleBrand();
  } else if (method === '2') {
    await updateBrandsFromFile();
  } else {
    console.log('Invalid method selected.');
    return;
  }
}

async function updateSingleBrand() {
  const brandId = readlineSync.question('Enter the brandId to update sellable status: ');
  const sellableInput = readlineSync.question('Set sellable to true or false? (t/f): ');
  const sellable = sellableInput.toLowerCase() === 't';

  try {
    const brand = await Brand.findOne({ where: { brandId } });
    if (!brand) {
      console.log(`Brand with brandId ${brandId} not found.`);
      return;
    }

    brand.sellable = sellable;
    await brand.save();
    console.log(`Brand ${brand.name} (brandId: ${brand.brandId}) sellable status updated to ${sellable}.`);
  } catch (error) {
    console.error('Error updating sellable status:', error);
    throw error;
  }
}

async function updateBrandsFromFile() {

  const filePath = 'scripts/data/unsellable-brands.txt';

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const sellableInput = readlineSync.question('Set sellable to true or false for all brands? (t/f): ');
  const sellable = sellableInput.toLowerCase() === 't';

  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const brandNames = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0); // Remove empty lines

    if (brandNames.length === 0) {
      console.log('No brand names found in the file.');
      return;
    }

    console.log(`Found ${brandNames.length} brand names in the file.`);
    console.log('Brand names to update:');
    brandNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

    const confirm = readlineSync.keyInYN(`Set sellable to ${sellable} for all these brands? `);
    if (!confirm) {
      console.log('Operation cancelled.');
      return;
    }

    // Process each brand
    const results = {
      updated: [],
      notFound: [],
      errors: []
    };

    for (const brandName of brandNames) {
      try {
        const brand = await Brand.findOne({
          where: {
            name: {
              [db.Sequelize.Op.iLike]: brandName // Case-insensitive search
            }
          }
        });

        if (!brand) {
          results.notFound.push(brandName);
          continue;
        }

        brand.sellable = sellable;
        await brand.save();
        results.updated.push(`${brand.name} (brandId: ${brand.brandId})`);
      } catch (error) {
        results.errors.push(`${brandName}: ${error.message}`);
      }
    }

    // Report results
    console.log('\n=== UPDATE RESULTS ===');
    console.log(`Successfully updated: ${results.updated.length}`);
    if (results.updated.length > 0) {
      results.updated.forEach(brand => console.log(`✓ ${brand}`));
    }

    if (results.notFound.length > 0) {
      console.log(`\nNot found: ${results.notFound.length}`);
      results.notFound.forEach(name => console.log(`✗ ${name}`));
    }

    if (results.errors.length > 0) {
      console.log(`\nErrors: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`! ${error}`));
    }

    console.log(`\nTotal processed: ${brandNames.length}`);
  } catch (error) {
    console.error('Error reading file or updating brands:', error);
    throw error;
  }
}

async function main() {
  while (true) {
    const action = readlineSync.question('Choose an action: (1) Sync Brands, (2) Update Sellable Status, (q) Quit: ');

    if (action === '1') {
      await syncBrands();
      console.log('');
    } else if (action === '2') {
      await updateSellable();
      console.log('');
    } else if (action === 'q') {
      return;
    } else {
      console.log('Invalid action selected.');
    }
  }
}

main()
  .then(() => {
    console.log('Process complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Process failed:', error);
    process.exit(1);
  });
