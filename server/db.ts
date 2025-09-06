import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema-postgres";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

console.log("Setting up Neon PostgreSQL database...");

const pool = neon(process.env.DATABASE_URL);
export const db = drizzle(pool, { schema });

console.log("Database ready for development");