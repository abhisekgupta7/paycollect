import { getRedisClient } from "@/lib/redis";

const DEFAULT_TTL_SECONDS = 10;

export async function getCachedJson<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL_SECONDS,
): Promise<T> {
  const redis = await getRedisClient();

  if (!redis) {
    return loader();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (error) {
    console.error(`Cache read failed for ${key}:`, error);
  }

  const value = await loader();

  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error(`Cache write failed for ${key}:`, error);
  }

  return value;
}

export async function invalidateCache(key: string) {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache invalidation failed for ${key}:`, error);
  }
}

export async function invalidateOrganizationCaches(organizationId: string) {
  await Promise.all([
    invalidateCache(`paycollect:org:${organizationId}:dashboard-summary`),
    invalidateCache(`paycollect:org:${organizationId}:customer-balances`),
    invalidateCache(`paycollect:org:${organizationId}:ledger-summary`),
    invalidateCache(`paycollect:org:${organizationId}:payments:ALL`),
    invalidateCache(`paycollect:org:${organizationId}:payments:PENDING`),
    invalidateCache(`paycollect:org:${organizationId}:payments:VERIFIED`),
  ]);
}
