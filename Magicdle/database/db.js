const { MongoClient } = require('mongodb');
require('dotenv').config();

// .env variables

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let dbConnection;

module.exports = {
  connectToDb: async () => {
    try {
      // Connect the client to the server
      await client.connect();
      
      // Specify your database name here
      dbConnection = client.db('mtg_database');
      
      console.log('Successfully connected to MongoDB.');
    } catch (error) {
      console.error('Connection to MongoDB failed:', error.message);
      throw error;
    }
  },
  
  // This function lets you grab the connection in other files
  getDb: () => {
    if (!dbConnection) {
      throw new Error('Database not initialized. Call connectToDb first.');
    }
    return dbConnection;
  }
}; 