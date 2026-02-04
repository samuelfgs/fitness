import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

// Create postgres client
const client = connectionString ? postgres(connectionString) : null;

// Create drizzle instance
export const db = client ? drizzle(client, { schema }) : ({} as any);

// Export schema for easy access
export { schema };
export * from "./schema";