import { db } from "./db";

export async function initializeDatabase() {
  console.log("Initializing SQLite database tables...");
  
  try {
    // Create tables using Drizzle's SQL generation
    await db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      role TEXT DEFAULT 'student' NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      title TEXT NOT NULL,
      description TEXT,
      instructor_id TEXT,
      thumbnail_url TEXT,
      is_published INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (instructor_id) REFERENCES users(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      video_url TEXT,
      order_index INTEGER NOT NULL,
      duration INTEGER,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      enrolled_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      UNIQUE(user_id, course_id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at INTEGER,
      time_spent INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id),
      UNIQUE(user_id, lesson_id)
    )`);

    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error creating database tables:", error);
    throw error;
  }
}
