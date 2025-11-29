import express from 'express';
import db from '../models/index.js';

const { User, Filter, Wish } = db;
const router = express.Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const user = await User.create({ name, username, password });
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      filters: []
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: `${error.message}: ${error.original?.detail || ''}`
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.scope('withPassword').findOne({ where: { username } });
    if (!user || !user.checkPassword(password)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const filters = await Filter.findAll({ where: { userId: user.id } });
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      filters: filters
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

export default router;
