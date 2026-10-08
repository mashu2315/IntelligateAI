const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('Redis: Max reconnection attempts reached. Giving up.');
            return false;
          }
          return Math.min(retries * 500, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      // Only log once, not on every retry
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });

    await redisClient.connect();
  } catch (error) {
    console.error(`Redis connection error: ${error.message}`);
    console.error('Gateway will continue without Redis');
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
