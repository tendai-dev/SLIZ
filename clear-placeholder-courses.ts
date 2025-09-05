import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function clearPlaceholderCourses() {
  console.log("Clearing all existing courses from database...");
  
  try {
    // Delete all existing data to start fresh with SCORM courses
    await sql`DELETE FROM progress`;
    await sql`DELETE FROM lessons`;
    await sql`DELETE FROM modules`;
    await sql`DELETE FROM enrollments`;
    await sql`DELETE FROM courses`;

    console.log("All existing courses cleared successfully!");
    
    // Show remaining courses
    const remainingCourses = await sql`SELECT * FROM courses`;
    console.log(`Remaining courses: ${remainingCourses.length}`);
    
  } catch (error) {
    console.error("Error clearing courses:", error);
    throw error;
  }
}

clearPlaceholderCourses();
