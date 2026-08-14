const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log(`Connecting to specified MongoDB URI: ${mongoUri.split('@')[1] || mongoUri}...`);
      await mongoose.connect(mongoUri);
      console.log('MongoDB Connected Successfully via MONGO_URI');
    } else {
      console.log('No external MONGO_URI specified. Starting embedded MongoMemoryServer for zero-friction local execution...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`Embedded MongoDB Server running at: ${mongoUri}`);
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error disconnecting DB:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
