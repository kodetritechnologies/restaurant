import { createClient } from 'redis';

const globalForRedis = global as unknown as { redisClient: ReturnType<typeof createClient> };

export const redisClient = globalForRedis.redisClient || createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 16748
    }
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redisClient = redisClient;

redisClient.on('error', err => console.error('Redis Client Error', err));

if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}
