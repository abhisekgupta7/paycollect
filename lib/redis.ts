import { createClient, type RedisClientType } from "redis";

type RedisClient = RedisClientType;

const globalForRedis = globalThis as typeof globalThis & {
  payCollectRedis?: RedisClient;
  payCollectRedisConnection?: Promise<RedisClient | null>;
};

function getRedisUrl() {
  return process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
}

export function getRedisClient() {
  if (globalForRedis.payCollectRedis) {
    return Promise.resolve(globalForRedis.payCollectRedis);
  }

  if (globalForRedis.payCollectRedisConnection) {
    return globalForRedis.payCollectRedisConnection;
  }

  const url = getRedisUrl();
  if (!url) {
    return Promise.resolve(null);
  }

  const client = createClient({ url });
  client.on("error", (error) => {
    console.error("Redis client error:", error);
  });

  globalForRedis.payCollectRedisConnection = client
    .connect()
    .then(() => {
      globalForRedis.payCollectRedis = client;
      return client;
    })
    .catch((error) => {
      console.error("Redis connection failed; using database reads:", error);
      globalForRedis.payCollectRedisConnection = undefined;
      return null;
    });

  return globalForRedis.payCollectRedisConnection;
}
