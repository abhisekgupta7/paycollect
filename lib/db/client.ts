import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;
const normalizedConnectionString = connectionString.includes("sslmode=")
  ? connectionString.includes("uselibpqcompat=")
    ? connectionString
    : `${connectionString}${connectionString.includes("?") ? "&" : "?"}uselibpqcompat=true`
  : connectionString;

const pool = new Pool({
  connectionString: normalizedConnectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  maxLifetimeSeconds: 300,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

pool.on("error", (error) => {
  console.error("Database pool connection error:", error.message);
});

function isTransientDatabaseError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? error.code : undefined;
  return (
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "57P01"
  );
}

export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientDatabaseError(error) || attempt === 3) {
        throw error;
      }

      console.warn(
        `${operationName} failed due to a transient database connection error; retrying (${attempt}/2).`,
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }

  throw new Error(`${operationName} failed after database retries`);
}

export const db = drizzle({ client: pool });
