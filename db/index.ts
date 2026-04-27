import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Enable SSL for hosted Postgres (Supabase, Neon, etc.). Disable for local dev.
const useSsl =
  /sslmode=require|supabase\.co|neon\.tech|render\.com|amazonaws\.com|rds\.amazonaws\.com/i.test(
    connectionString,
  );

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
export { schema };
