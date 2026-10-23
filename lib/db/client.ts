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
});

export const db = drizzle({ client: pool });
