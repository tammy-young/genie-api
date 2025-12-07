import express from 'express';
import 'dotenv/config';
import cors from 'cors';

// Import route modules
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import filterRoutes from './routes/filters.js';
import wishesRoutes from './routes/wishes.js';
import apiRoutes from './routes/api.js';
import indexRoutes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));

app.use(function (req, res, next) {
  const origin = req.headers.origin;
  if (origin !== process.env.ALLOWED_ORIGIN) {
    res.status(403).send('403 Forbidden');
    return;
  }
  next();
});

// Route handlers
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/filters', filterRoutes);
app.use('/wishes', wishesRoutes);
app.use('/api', apiRoutes);
app.use('/', indexRoutes);

app.listen(PORT, (error) => {
  if (!error)
    console.log("Server is Successfully Running, and App is listening on port " + PORT)
  else
    console.log("Error occurred, server can't start", error);
});
