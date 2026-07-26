import { createClient } from 'redis';

export const getRedisClient = async () => {
    const client = createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT) || 16748
        }
    });

    client.on('error', err => console.error('Redis Client Error', err));
    
    await client.connect();
    return client;
};
