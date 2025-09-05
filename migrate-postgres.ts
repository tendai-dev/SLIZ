import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function createTables() {
  console.log("Creating PostgreSQL database tables...");
  
  try {
    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Insert default SCORM category
    await sql`
      INSERT INTO categories (id, name, description, created_at)
      VALUES ('scorm-courses', 'SCORM Courses', 'Interactive SCORM-based learning modules from the Sports Leaders Institute of Zimbabwe', NOW())
      ON CONFLICT (id) DO NOTHING
    `;

    console.log("Categories table created and SCORM category added!");
    
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

createTables();
