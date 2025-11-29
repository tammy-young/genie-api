import express from 'express';
import getBrands from '../api/getBrands.js';
import getSeller from '../api/getSeller.js';
import search from '../api/search.js';

const router = express.Router();

// GET /api/brands
router.get('/brands', (req, res) => {
  const { onlySellable } = req.query;
  const onlySellableBool = onlySellable === 'true';
  getBrands(onlySellableBool)
    .then(data => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(data, null, 2));
    })
    .catch((e) => {
      console.log("Error: " + e);
      res.status(500).json({ error: "Failed to fetch brands" });
    });
});

// GET /api/seller
router.get('/seller', (req, res) => {
  let sellerId = req.query.sellerId;
  getSeller(sellerId)
    .then((username) => {
      const data = { "sellerUser": username };
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(data, null, 2));
    })
    .catch((e) => {
      res.json({ "sellerUser": "" });
    });
});

// GET /api/search
router.get('/search', async (req, res) => {
  search(req)
    .then(data => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(data, null, 2));
    })
    .catch((e) => {
      console.log("Search error: " + e);
      res.status(500).json({ error: "Search failed" });
    });
});

export default router;