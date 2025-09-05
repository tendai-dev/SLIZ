import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";

const DATABASE_URL = 'postgresql://neondb_owner:npg_nYTUPFMK7v3m@ep-twilight-tree-adeg0y53-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

async function createTables() {
  console.log("Creating database tables...");
  
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR DEFAULT 'student' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create courses table
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        description TEXT,
        instructor_id VARCHAR REFERENCES users(id),
        thumbnail_url VARCHAR,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create modules table
    await sql`
      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id VARCHAR NOT NULL REFERENCES courses(id),
        title VARCHAR NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create lessons table
    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id VARCHAR NOT NULL REFERENCES modules(id),
        title VARCHAR NOT NULL,
        content TEXT,
        video_url VARCHAR,
        order_index INTEGER NOT NULL,
        duration INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create enrollments table
    await sql`
      CREATE TABLE IF NOT EXISTS enrollments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        course_id VARCHAR NOT NULL REFERENCES courses(id),
        enrolled_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP,
        UNIQUE(user_id, course_id)
      )
    `;

    // Create progress table
    await sql`
      CREATE TABLE IF NOT EXISTS progress (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        lesson_id VARCHAR NOT NULL REFERENCES lessons(id),
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        time_spent INTEGER DEFAULT 0,
        UNIQUE(user_id, lesson_id)
      )
    `;

    // Create assessments table
    await sql`
      CREATE TABLE IF NOT EXISTS assessments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id VARCHAR NOT NULL REFERENCES lessons(id),
        title VARCHAR NOT NULL,
        description TEXT,
        passing_score INTEGER DEFAULT 70,
        time_limit INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create questions table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        assessment_id VARCHAR NOT NULL REFERENCES assessments(id),
        question_text TEXT NOT NULL,
        question_type VARCHAR NOT NULL,
        options JSONB,
        correct_answer TEXT NOT NULL,
        points INTEGER DEFAULT 1,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create assessment_attempts table
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        assessment_id VARCHAR NOT NULL REFERENCES assessments(id),
        score INTEGER,
        passed BOOLEAN DEFAULT false,
        started_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP,
        answers JSONB
      )
    `;

    // Create achievements table
    await sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        description TEXT,
        icon VARCHAR,
        criteria JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create user_achievements table
    await sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        achievement_id VARCHAR NOT NULL REFERENCES achievements(id),
        earned_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, achievement_id)
      )
    `;

    // Create certificates table
    await sql`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        course_id VARCHAR NOT NULL REFERENCES courses(id),
        issued_at TIMESTAMP DEFAULT NOW() NOT NULL,
        certificate_url VARCHAR,
        UNIQUE(user_id, course_id)
      )
    `;

    // Create forum_posts table
    await sql`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id VARCHAR NOT NULL REFERENCES courses(id),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        title VARCHAR NOT NULL,
        content TEXT NOT NULL,
        parent_id VARCHAR REFERENCES forum_posts(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        recipient_id VARCHAR NOT NULL REFERENCES users(id),
        subject VARCHAR,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        sent_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

createTables().catch(console.error);
