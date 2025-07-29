import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.VALKEY_URL || 'redis://localhost:6379',
  socket: {
    reconnectDelay: 1000,
    maxRetriesPerRequest: 3,
  },
});

redisClient.on('error', (err) => {
  console.error('Redis/Valkey Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis/Valkey');
});

redisClient.on('disconnect', () => {
  console.log('Disconnected from Redis/Valkey');
});

// Connect to Redis/Valkey
await redisClient.connect();

export default redisClient;