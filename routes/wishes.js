import express from 'express';
import db from '../models/index.js';
import fetchData from '../utils/fetchData.js';

const { Wish, User, Brand } = db;
const router = express.Router();

const CHECK_AVAILABILITY_URL = (sellerId) => `http://www.stardoll.com/en/com/user/getBazaar.php?storeType=1&sellerId=${sellerId}&startMode=`

// GET /wishes - Get all wishes for a user
router.get('/', async (req, res) => {
  try {
    const { userId, page = 1, limit = 8 } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const offset = (page - 1) * limit;

    const { count, rows: wishes } = await Wish.findAndCountAll({
      where: { userId: parseInt(userId) },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      wishes: wishes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /wishes/:id - Get a specific wish
router.get('/:id', async (req, res) => {
  try {
    const wish = await Wish.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'username']
      }]
    });

    if (!wish) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    // Get brand name with type conversion
    let brandName = null;
    if (wish.brand) {
      const brandIdInt = parseInt(wish.brand);
      if (!isNaN(brandIdInt)) {
        const brand = await Brand.findOne({
          where: { brandId: brandIdInt },
          attributes: ['name']
        });
        brandName = brand?.name || null;
      }
    }

    // Transform the result to include brandName field
    const wishData = wish.toJSON();
    const transformedWish = {
      ...wishData,
      brandName
    };

    res.json(transformedWish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /wishes - Add item to wishlist
router.post('/', async (req, res) => {
  try {
    const { userId, item, sellerUsername } = req.body;

    if (!userId || !item) {
      return res.status(400).json({
        error: 'userId and item are required'
      });
    }

    // Check if item is already in wishlist
    const existingWish = await Wish.findOne({
      where: { userId: parseInt(userId), name: item.name, sellerId: item.sellerId, sellPrice: item.sellPrice }
    });

    if (existingWish) {
      return res.status(409).json({
        error: 'Item is already in wishlist',
        wish: existingWish
      });
    }

    const wish = await Wish.create({ userId, sellerUsername, itemId: item.itemId, ...item, currencyType: parseInt(item.currencyType) });
    res.status(201).json(wish);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /wishes/:id - Remove item from wishlist
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Wish.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Item removed from wishlist successfully' });
    } else {
      res.status(404).json({ error: 'Wish not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /wishes/item/:userId/:itemSellerId/:itemId - Remove specific item from user's wishlist
router.delete('/item/:userId/:itemSellerId/:itemId', async (req, res) => {
  try {
    const { userId, itemSellerId, itemId } = req.params;

    const deleted = await Wish.destroy({
      where: { userId, itemSellerId, itemId }
    });

    if (deleted) {
      res.json({ message: 'Item removed from wishlist successfully' });
    } else {
      res.status(404).json({ error: 'Item not found in wishlist' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /wishes/check - Check if item is in wishlist
router.post('/check', async (req, res) => {
  try {
    const { userId, itemSellerId, itemId, price } = req.body;

    if (!userId || !itemSellerId || !itemId || !price) {
      return res.status(400).json({
        error: 'userId, itemSellerId, itemId, and price are required'
      });
    }

    const wish = await Wish.findOne({
      where: { userId: parseInt(userId), sellerId: itemSellerId, itemId, sellPrice: price }
    });

    res.json({
      wishId: wish ? wish.id : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /wishes/available - Check availability of wishlist item
router.post('/available', async (req, res) => {
  try {
    const { wishId } = req.body;
    if (!wishId) {
      return res.status(400).json({ error: 'wishId is required' });
    }
    const wish = await Wish.findByPk(wishId);
    if (!wish) {
      return res.status(404).json({ error: 'Wish not found' });
    }

    const bazaarData = await fetchData(CHECK_AVAILABILITY_URL(wish.sellerId));
    const items = bazaarData.bazaarItems || [];
    const isAvailable = items.some(item => parseInt(item.itemId) === wish.itemId && item.sellPrice == wish.sellPrice);

    res.json({ available: isAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


// GET /wishes/user/:userId - Get all wishes for a specific user (alternative endpoint)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: wishes } = await Wish.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get unique brand IDs (convert strings to integers)
    const brandIds = [...new Set(wishes.map(wish => parseInt(wish.brand)).filter(id => !isNaN(id)))];

    // Fetch all relevant brands in one query
    const brands = await Brand.findAll({
      where: {
        brandId: brandIds
      },
      attributes: ['brandId', 'name']
    });

    // Create a lookup map
    const brandMap = {};
    brands.forEach(brand => {
      brandMap[brand.brandId] = brand.name;
    });

    // Transform the results to include brandName field
    const transformedWishes = wishes.map(wish => {
      const wishData = wish.toJSON();
      const brandIdInt = parseInt(wishData.brand);
      return {
        ...wishData,
        brandName: brandMap[brandIdInt] || null
      };
    });

    res.json({
      wishes: transformedWishes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
