// server/server.js 
const express = require('express');
const cors = require('cors');  require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;  
app.use(cors());  app.use(express.json());  
// Sample route  
app.get('/api/hello', (req, res) => 
    {    res.json({ message: 'Hello from the backend!' });
});  
app.listen(PORT, () => 
    {    console.log(`Backend server running on http://localhost:${PORT}`);  
});
