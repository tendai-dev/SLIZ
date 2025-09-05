import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connection successful:', result[0]);
    
    // Test if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Available tables:', tables.map(t => t.table_name));
    
    // Check courses table structure
    const courseColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND table_schema = 'public'
    `;
    console.log('Courses table columns:', courseColumns);
    
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
