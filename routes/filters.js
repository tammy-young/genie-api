import express from 'express';
import db from '../models/index.js';

const { Filter } = db;
const router = express.Router();

// GET /filters - Get all filters for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const filters = await Filter.findAll({ 
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(filters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /filters - Create a new filter
router.post('/', async (req, res) => {
  try {
    const { name, userId, query } = req.body;
    const filter = await Filter.create({ name, userId, query });
    res.status(201).json(filter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /filters/:id - Update a filter
router.put('/:id', async (req, res) => {
  try {
    const { name, query } = req.body;
    const [updated] = await Filter.update(
      { name, query },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedFilter = await Filter.findByPk(req.params.id);
      res.json(updatedFilter);
    } else {
      res.status(404).json({ error: 'Filter not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /filters/:id - Delete a filter
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Filter.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Filter deleted successfully' });
    } else {
      res.status(404).json({ error: 'Filter not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
