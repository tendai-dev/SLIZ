import {
  users,
  courses,
  modules,
  lessons,
  enrollments,
  lessonProgress,
  assessments,
  questions,
  assessmentAttempts,
  achievements,
  userAchievements,
  certificates,
  forumPosts,
  messages,
  categories,
  type User,
  type UpsertUser,
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
  type LessonProgress,
  type Assessment,
  type Question,
  type AssessmentAttempt,
  type Achievement,
  type UserAchievement,
  type Certificate,
  type ForumPost,
  type Message,
  type InsertCourse,
  type InsertModule,
  type InsertLesson,
  type InsertEnrollment,
  type InsertAssessment,
  type InsertForumPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course operations
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;
  
  // Module operations
  getModulesByCourse(courseId: string): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: string, module: Partial<InsertModule>): Promise<Module>;
  deleteModule(id: string): Promise<void>;
  
  // Lesson operations
  getLessonsByModule(moduleId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Enrollment operations
  enrollUser(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsByUser(userId: string): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined>;
  updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<Enrollment>;
  
  // Progress tracking
  updateLessonProgress(userId: string, lessonId: string, completed: boolean, timeSpent: number): Promise<LessonProgress>;
  getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | undefined>;
  getCourseProgressStats(userId: string, courseId: string): Promise<{ completedLessons: number; totalLessons: number; totalTimeSpent: number }>;
  
  // Assessment operations
  getAssessmentsByCourse(courseId: string): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  
  // Question operations
  getQuestionsByAssessment(assessmentId: string): Promise<Question[]>;
  
  // Assessment attempt operations
  createAssessmentAttempt(attempt: Omit<AssessmentAttempt, 'id' | 'startedAt'>): Promise<AssessmentAttempt>;
  getAssessmentAttempts(userId: string, assessmentId: string): Promise<AssessmentAttempt[]>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  // Certificate operations
  createCertificate(userId: string, courseId: string, certificateUrl: string): Promise<Certificate>;
  getCertificatesByUser(userId: string): Promise<Certificate[]>;
  
  // Forum operations
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumPostsByCourse(courseId: string): Promise<ForumPost[]>;
  
  // Statistics
  getDashboardStats(userId: string): Promise<{
    enrolledCourses: number;
    completedCourses: number;
    totalTimeSpent: number;
    achievements: number;
  }>;
  
  getInstructorStats(instructorId: string): Promise<{
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
    totalRevenue: number;
  }>;
  
  getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.instructorId, instructorId)).orderBy(desc(courses.createdAt));
  }

  // Module operations
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.orderIndex);
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  async updateModule(id: string, module: Partial<InsertModule>): Promise<Module> {
    const [updatedModule] = await db.update(modules).set(module).where(eq(modules.id, id)).returning();
    return updatedModule;
  }

  async deleteModule(id: string): Promise<void> {
    await db.delete(modules).where(eq(modules.id, id));
  }

  // Lesson operations
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    return db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(lessons.orderIndex);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db.update(lessons).set(lesson).where(eq(lessons.id, id)).returning();
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  // Enrollment operations
  async enrollUser(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.enrolledAt));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
  }

  async getEnrollment(userId: string, courseId: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return enrollment;
  }

  async updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<Enrollment> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set({ progress: progress.toString() })
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
      .returning();
    return updatedEnrollment;
  }

  // Progress tracking
  async updateLessonProgress(userId: string, lessonId: string, completed: boolean, timeSpent: number): Promise<LessonProgress> {
    const [existingProgress] = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));

    if (existingProgress) {
      const [updatedProgress] = await db
        .update(lessonProgress)
        .set({
          completed,
          completedAt: completed ? new Date() : null,
          timeSpent: existingProgress.timeSpent + timeSpent,
        })
        .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
        .returning();
      return updatedProgress;
    } else {
      const [newProgress] = await db
        .insert(lessonProgress)
        .values({
          userId,
          lessonId,
          completed,
          completedAt: completed ? new Date() : null,
          timeSpent,
        })
        .returning();
      return newProgress;
    }
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | undefined> {
    const [progress] = await db
      .select()
      .from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)));
    return progress;
  }

  async getCourseProgressStats(userId: string, courseId: string): Promise<{ completedLessons: number; totalLessons: number; totalTimeSpent: number }> {
    const result = await db
      .select({
        completedLessons: count(sql`CASE WHEN ${lessonProgress.completed} = true THEN 1 END`),
        totalLessons: count(lessons.id),
        totalTimeSpent: sum(lessonProgress.timeSpent),
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .leftJoin(lessonProgress, and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)))
      .where(eq(modules.courseId, courseId));

    return {
      completedLessons: Number(result[0]?.completedLessons || 0),
      totalLessons: Number(result[0]?.totalLessons || 0),
      totalTimeSpent: Number(result[0]?.totalTimeSpent || 0),
    };
  }

  // Assessment operations
  async getAssessmentsByCourse(courseId: string): Promise<Assessment[]> {
    return db.select().from(assessments).where(eq(assessments.courseId, courseId));
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }

  // Question operations
  async getQuestionsByAssessment(assessmentId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.assessmentId, assessmentId)).orderBy(questions.orderIndex);
  }

  // Assessment attempt operations
  async createAssessmentAttempt(attempt: Omit<AssessmentAttempt, 'id' | 'startedAt'>): Promise<AssessmentAttempt> {
    const [newAttempt] = await db.insert(assessmentAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getAssessmentAttempts(userId: string, assessmentId: string): Promise<AssessmentAttempt[]> {
    return db
      .select()
      .from(assessmentAttempts)
      .where(and(eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.assessmentId, assessmentId)))
      .orderBy(desc(assessmentAttempts.startedAt));
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(userAchievements).values({ userId, achievementId }).returning();
    return newAchievement;
  }

  // Certificate operations
  async createCertificate(userId: string, courseId: string, certificateUrl: string): Promise<Certificate> {
    const [newCertificate] = await db.insert(certificates).values({ userId, courseId, certificateUrl }).returning();
    return newCertificate;
  }

  async getCertificatesByUser(userId: string): Promise<Certificate[]> {
    return db.select().from(certificates).where(eq(certificates.userId, userId));
  }

  // Forum operations
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async getForumPostsByCourse(courseId: string): Promise<ForumPost[]> {
    return db.select().from(forumPosts).where(eq(forumPosts.courseId, courseId)).orderBy(desc(forumPosts.createdAt));
  }

  // Statistics
  async getDashboardStats(userId: string): Promise<{
    enrolledCourses: number;
    completedCourses: number;
    totalTimeSpent: number;
    achievements: number;
  }> {
    const enrolledResult = await db.select({ count: count() }).from(enrollments).where(eq(enrollments.userId, userId));
    const completedResult = await db
      .select({ count: count() })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.progress, '100')));
    const timeResult = await db
      .select({ total: sum(lessonProgress.timeSpent) })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));
    const achievementResult = await db
      .select({ count: count() })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    return {
      enrolledCourses: enrolledResult[0]?.count || 0,
      completedCourses: completedResult[0]?.count || 0,
      totalTimeSpent: Number(timeResult[0]?.total || 0),
      achievements: achievementResult[0]?.count || 0,
    };
  }

  async getInstructorStats(instructorId: string): Promise<{
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
    totalRevenue: number;
  }> {
    const coursesResult = await db.select({ count: count() }).from(courses).where(eq(courses.instructorId, instructorId));
    const studentsResult = await db
      .select({ count: count() })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(courses.instructorId, instructorId));

    return {
      totalCourses: coursesResult[0]?.count || 0,
      totalStudents: studentsResult[0]?.count || 0,
      avgRating: 4.8, // Placeholder - would calculate from actual ratings
      totalRevenue: 0, // Placeholder - would calculate from actual payments
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
  }> {
    const usersResult = await db.select({ count: count() }).from(users);
    const coursesResult = await db.select({ count: count() }).from(courses);
    const enrollmentsResult = await db.select({ count: count() }).from(enrollments);

    return {
      totalUsers: usersResult[0]?.count || 0,
      totalCourses: coursesResult[0]?.count || 0,
      totalEnrollments: enrollmentsResult[0]?.count || 0,
      totalRevenue: 0, // Placeholder - would calculate from actual payments
    };
  }
}

export const storage = new DatabaseStorage();
