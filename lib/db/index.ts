import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

// Create postgres client
if (connectionString) {
  try {
    const url = new URL(connectionString.replace('postgres://', 'http://').replace('postgresql://', 'http://'));
    console.log(`[DB Init] Attempting connection to host: ${url.hostname}`);
  } catch (e) {
    console.log('[DB Init] Could not parse DATABASE_URL for logging');
  }
}

const client = connectionString ? postgres(connectionString, {
  ssl: 'require',
  prepare: false, // Required for PGBouncer/Transaction mode in serverless
  connect_timeout: 10,
  max: 1, // Recommended for serverless to avoid exhausting connections
}) : null;

// Create drizzle instance
export const db = client ? drizzle(client, { schema }) : new Proxy({} as any, {
  get(_, prop) {
    const errorMsg = `Database connection failed: DATABASE_URL is missing or invalid. Attempted to access: ${String(prop)}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
});

// Export schema for easy access
export { schema };
export * from "./schema";