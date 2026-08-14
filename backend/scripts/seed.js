const dotenv = require('dotenv');
dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const seedData = require('./seedData');

async function run() {
  await connectDB();
  await seedData();
  await disconnectDB();
  process.exit(0);
}

run();
