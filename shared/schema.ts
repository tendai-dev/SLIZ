import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['student', 'instructor', 'admin']);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('student').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url"),
  instructorId: varchar("instructor_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  duration: integer("duration"), // in weeks
  difficulty: varchar("difficulty", { length: 20 }), // 'Foundation', 'Intermediate', 'Advanced', 'Professional'
  price: decimal("price", { precision: 10, scale: 2 }),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course modules
export const modules = pgTable("modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Lessons within modules
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  videoUrl: varchar("video_url"),
  duration: integer("duration"), // in minutes
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course enrollments
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  progress: decimal("progress", { precision: 5, scale: 2 }).default('0'),
});

// Lesson progress tracking
export const lessonProgress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  lessonId: varchar("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
});

// Assessments/Quizzes
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  moduleId: varchar("module_id"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: decimal("passing_score", { precision: 5, scale: 2 }),
  maxAttempts: integer("max_attempts").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assessment questions
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'multiple_choice', 'true_false', 'essay'
  question: text("question").notNull(),
  options: jsonb("options"), // for multiple choice questions
  correctAnswer: text("correct_answer"),
  points: integer("points").default(1),
  orderIndex: integer("order_index").notNull(),
});

// Assessment attempts
export const assessmentAttempts = pgTable("assessment_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  assessmentId: varchar("assessment_id").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  answers: jsonb("answers"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  passed: boolean("passed").default(false),
});

// Achievements/Badges
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  condition: text("condition"), // JSON string describing achievement condition
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  courseId: varchar("course_id").notNull(),
  certificateUrl: varchar("certificate_url"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

// Discussion forums
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  userId: varchar("user_id").notNull(),
  parentId: varchar("parent_id"), // for replies
  title: varchar("title", { length: 200 }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages between users
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  subject: varchar("subject", { length: 200 }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  instructedCourses: many(courses),
  lessonProgress: many(lessonProgress),
  assessmentAttempts: many(assessmentAttempts),
  achievements: many(userAchievements),
  certificates: many(certificates),
  forumPosts: many(forumPosts),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
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
  assessments: many(assessments),
  certificates: many(certificates),
  forumPosts: many(forumPosts),
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

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  module: one(modules, {
    fields: [assessments.moduleId],
    references: [modules.id],
  }),
  questions: many(questions),
  attempts: many(assessmentAttempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  assessment: one(assessments, {
    fields: [questions.assessmentId],
    references: [assessments.id],
  }),
}));

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({ one }) => ({
  user: one(users, {
    fields: [assessmentAttempts.userId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [assessmentAttempts.assessmentId],
    references: [assessments.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  course: one(courses, {
    fields: [forumPosts.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
  parent: one(forumPosts, {
    fields: [forumPosts.parentId],
    references: [forumPosts.id],
  }),
  replies: many(forumPosts),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true, createdAt: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true, createdAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true });
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, createdAt: true });
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type Message = typeof messages.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
