import express from 'express';
import db from '../models/index.js';
import bcrypt from 'bcrypt';

const { User } = db;
const router = express.Router();

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: ['filters']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      filters: user.filters
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'username', 'createdAt']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /users/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, username, password } = req.body;

    let updatedFields = { name, username };
    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedFields.password = hashedPassword;
    }

    const [updated] = await User.update(
      updatedFields,
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    if (error.original && error.original.code === '23505') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;