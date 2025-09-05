import { neon } from "@neondatabase/serverless";

export async function initializeScormCategory() {
  console.log("Initializing SCORM category...");
  
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Check if SCORM category already exists
    const existingCategory = await sql`
      SELECT id FROM categories WHERE id = 'scorm-courses' LIMIT 1
    `;

    if (existingCategory.length === 0) {
      // Create SCORM category
      await sql`
        INSERT INTO categories (id, name, description, created_at)
        VALUES ('scorm-courses', 'SCORM Courses', 'Interactive SCORM-based learning modules from the Sports Leaders Institute of Zimbabwe', NOW())
      `;
      
      console.log("SCORM category created successfully!");
    } else {
      console.log("SCORM category already exists");
    }
  } catch (error) {
    console.error("Error initializing SCORM category:", error);
    throw error;
  }
}
