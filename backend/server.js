// require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



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
const guessRoutes = require('./routes/guess')

app.use('/api/daily', dailyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/hint', hintRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/guess', guessRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI, { dbName: 'Magicdle' })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * Entry point for the Express application.
 * Responsibility: Initializes Express, connects to MongoDB, and mounts API routes.
 */
