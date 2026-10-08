require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Start the server first so health checks work immediately
  app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
  });

  // Connect to MongoDB (non-blocking, won't crash if unavailable)
  connectDB();

  // Connect to Redis (non-blocking, won't crash if unavailable)
  connectRedis();
};

startServer();
