import { sql, relations } from 'drizzle-orm';
import {
  index,
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text
    expire: integer("expire").notNull(), // timestamp as integer
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// User storage table for Replit Auth
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default('student').notNull(), // 'student', 'instructor', 'admin'
  createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`).notNull(),
});

// Progress tracking
export const progress = sqliteTable("progress", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  completed: integer("completed", { mode: "boolean" }).default(false).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // in seconds
  completedAt: integer("completed_at"),
  createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`).notNull(),
});

// Quiz attempts
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  answers: text("answers").notNull(), // JSON string of selected answers
  score: integer("score").notNull(), // Percentage score (0-100)
  passed: integer("passed", { mode: "boolean" }).default(false).notNull(),
  completedAt: integer("completed_at").default(sql`(unixepoch())`).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // Time in seconds
});

// User badges
export const userBadges = sqliteTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull(), // References course badge
  earnedAt: integer("earned_at").default(sql`(unixepoch())`).notNull(),
  quizAttemptId: text("quiz_attempt_id").notNull().references(() => quizAttempts.id, { onDelete: "cascade" }),
});

// Certificates
export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  issuedAt: integer("issued_at").default(sql`(unixepoch())`).notNull(),
  coursesCompleted: text("courses_completed").notNull(), // JSON array of course IDs
  totalScore: real("total_score").notNull(), // Average score across completed courses
  imageUrl: text("image_url"),
});

// Course categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
});

// Courses table
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  instructorId: text("instructor_id").notNull(),
  categoryId: text("category_id").notNull(),
  duration: integer("duration"), // in weeks
  difficulty: text("difficulty"), // 'Foundation', 'Intermediate', 'Advanced', 'Professional'
  price: real("price"),
  isPublished: integer("is_published").default(0), // 0 = false, 1 = true
  createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`).notNull(),
});

// Course modules
export const modules = sqliteTable("modules", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  courseId: text("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
});

// Lessons within modules
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  moduleId: text("module_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  duration: integer("duration"), // in minutes
  orderIndex: integer("order_index").notNull(),
  createdAt: integer("created_at").default(sql`(unixepoch())`).notNull(),
});

// Course enrollments
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull(),
  enrolledAt: integer("enrolled_at").default(sql`(unixepoch())`).notNull(),
  completedAt: integer("completed_at"),
  progress: real("progress").default(0),
});

// Lesson progress tracking
export const lessonProgress = sqliteTable("lesson_progress", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  completed: integer("completed").default(0), // 0 = false, 1 = true
  completedAt: integer("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
});

// Basic relations for the simplified schema
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  instructedCourses: many(courses),
  lessonProgress: many(lessonProgress),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  modules: many(modules),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true, createdAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
