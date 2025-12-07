import express from 'express';
import db from '../models/index.js';

const router = express.Router();

// GET /health - Health check and database status
router.get('/health', async (req, res) => {
  try {
    // Test database connection using the configured connection
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync the database (creates tables if they don't exist)
    await db.sequelize.sync();

    res.json({
      status: "healthy",
      message: "Genie API is running",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      status: "unhealthy",
      message: "Genie API is running but database connection failed",
      database: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET / - Welcome message
router.get('/', async (req, res) => {
  res.json({
    message: "Welcome to Genie API",
    version: "1.0.0",
    endpoints: {
      auth: "/auth (signup, login)",
      users: "/users",
      filters: "/filters",
      wishes: "/wishes (watchlist items)",
      api: "/api (brands, seller, search)",
      health: "/health"
    }
  });
});

export default router;