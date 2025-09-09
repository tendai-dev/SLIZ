import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema-postgres";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using fallback for development");
  process.env.DATABASE_URL = "postgresql://localhost:5432/sliz_lms";
}

console.log("Setting up Neon PostgreSQL database...");

const pool = neon(process.env.DATABASE_URL);
export const db = drizzle(pool, { schema });

console.log("Database ready for development");