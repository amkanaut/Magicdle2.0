// server/server.js 
// Imports, Standard Libraries First
require('dotenv').config();
const express = require('express');
const cors = require('cors');

//Local imports
const helloRoutes = require('./routes/hello');
const logger = require('./middleware/logger');



// Configuration
const app = express();
 

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes 
app.use('/api/hello', helloRoutes);
  
 
// 6. ERROR HANDLING (Optional but recommended - always comes last)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Route
app.get('/api/hello', (req, res) => 
    {    res.json({ message: 'Hello from the backend!' });
});

// Start server
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => 
    {    console.log(`Backend server running on http://localhost:${PORT}`);  
});
