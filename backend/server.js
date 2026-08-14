const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bridgeRoutes = require('./routes/bridgeRoutes');
const crossingRoutes = require('./routes/crossingRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB (or memory server)
connectDB().then(async () => {
  // Auto-seed if running on fresh DB
  const Bridge = require('./models/Bridge');
  const count = await Bridge.countDocuments();
  if (count === 0) {
    console.log('No bridges detected in database. Triggering automatic initial seed...');
    const seedData = require('./scripts/seedData');
    await seedData();
  }
});

// Middleware
app.use(
  cors({
    origin: '*', // Allow all origins for dev/testing ease
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'SafeBridge Anti-Fraud & Pedestrian Incentive API',
    timestamp: new Date().toISOString(),
    config: {
      cooldownHours: process.env.COOLDOWN_HOURS || 6,
      minCrossingSeconds: process.env.MIN_CROSSING_SECONDS || 12,
      maxCrossingSeconds: process.env.MAX_CROSSING_SECONDS || 180,
      dailyCap: process.env.DAILY_CROSSING_CAP || 4,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bridges', bridgeRoutes);
app.use('/api/crossings', crossingRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` SafeBridge API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Anti-Fraud Config: ${process.env.COOLDOWN_HOURS || 6}h Cooldown, ` +
              `Min ${process.env.MIN_CROSSING_SECONDS || 12}s - Max ${process.env.MAX_CROSSING_SECONDS || 180}s`);
  console.log(`======================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
});

module.exports = { app, server };
