import { sql, relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  json,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table for Clerk Auth
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default('student').notNull(), // 'student', 'instructor', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course categories
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  instructorId: text("instructor_id").notNull(),
  categoryId: text("category_id").notNull(),
  duration: integer("duration"), // in weeks
  difficulty: text("difficulty"), // 'Foundation', 'Intermediate', 'Advanced', 'Professional'
  price: real("price"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course modules
export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lessons within modules
export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  duration: integer("duration"), // in minutes
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course enrollments
export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  courseId: text('course_id').notNull().references(() => courses.id),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  progress: integer('progress').default(0).notNull(),
  scormData: json('scorm_data'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
  currentLocation: text('current_location'),
  suspendData: text('suspend_data'),
});

// Lesson progress tracking
export const progress = pgTable("progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
});

// Assessment questions
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON string
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assessment attempts
export const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").default(70),
  timeLimit: integer("time_limit"), // in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assessmentAttempts = pgTable("assessment_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  assessmentId: text("assessment_id").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").default(false),
  answers: text("answers").notNull(), // JSON string
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Achievements system
export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  condition: text("condition").notNull(), // JSON string describing unlock condition
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  certificateUrl: text("certificate_url"),
});

// Forum posts
export const forumPosts = pgTable("forum_posts", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  parentId: text("parent_id"), // for replies
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull(),
  answers: text("answers").notNull(), // JSON array of answer indices
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  timeSpent: integer("time_spent").default(0), // in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User badges
export const userBadges = pgTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  badgeId: text("badge_id").notNull(), // e.g., "badge_scorm-course-1"
  courseId: text("course_id").notNull(),
  quizAttemptId: text("quiz_attempt_id").notNull(),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

// Certificates for completing multiple courses
export const courseCertificates = pgTable("course_certificates", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  coursesCompleted: text("courses_completed").notNull(), // JSON array of course IDs
  averageScore: real("average_score").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  instructedCourses: many(courses),
  progress: many(progress),
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
  progress: many(progress),
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

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ createdAt: true, updatedAt: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ createdAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ createdAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ enrolledAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Progress = typeof progress.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
