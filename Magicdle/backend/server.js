const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const dailyRoutes = require('./routes/daily');
const searchRoutes = require('./routes/search');
const hintRoutes = require('./routes/hint');
const archiveRoutes = require('./routes/archive');

app.use('/api/daily', dailyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/hint', hintRoutes);
app.use('/api/archive', archiveRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * Entry point for the Express application.
 * Responsibility: Initializes Express, connects to MongoDB, and mounts API routes.
 */
