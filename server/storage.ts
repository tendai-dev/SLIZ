import {
  users,
  courses,
  modules,
  lessons,
  enrollments,
  progress,
  categories,
  questions,
  assessments,
  assessmentAttempts,
  achievements,
  userAchievements,
  certificates,
  forumPosts,
  messages,
  quizAttempts,
  userBadges,
  courseCertificates,
  type User,
  type UpsertUser,
  type Course,
  type Module,
  type Lesson,
  type Enrollment,
  type Progress,
  type InsertCourse,
  type InsertModule,
  type InsertLesson,
  type InsertEnrollment,
} from "@shared/schema-postgres";
import { db } from "./db";
import { eq, and, desc, sql, count, sum } from "drizzle-orm";
import { randomUUID } from "crypto";

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
  updateLessonProgress(userId: string, lessonId: string, completed: boolean, timeSpent: number): Promise<Progress>;
  getLessonProgress(userId: string, lessonId: string): Promise<Progress | undefined>;
  getCourseProgressStats(userId: string, courseId: string): Promise<{ completedLessons: number; totalLessons: number; totalTimeSpent: number }>;
  
  // Simplified interface - remove unused operations for now
  
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
  async createEnrollment(enrollmentData: any): Promise<Enrollment> {
    const [result] = await db.insert(enrollments).values(enrollmentData).returning();
    return result;
  }

  async enrollUser(enrollment: InsertEnrollment): Promise<Enrollment> {
    const enrollmentData = {
      id: enrollment.id || `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: new Date(),
      progress: enrollment.progress || 0,
    };
    return this.createEnrollment(enrollmentData);
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

  async updateEnrollmentProgress(userId: string, courseId: string, progress: number, scormData?: any, currentLocation?: string, suspendData?: string): Promise<any> {
    const updateData: any = { 
      progress,
      completedAt: progress >= 100 ? new Date() : null,
      lastAccessedAt: new Date()
    };
    
    if (scormData) {
      updateData.scormData = scormData;
    }
    
    if (currentLocation) {
      updateData.currentLocation = currentLocation;
    }
    
    if (suspendData) {
      updateData.suspendData = suspendData;
    }
    
    const result = await db
      .update(enrollments)
      .set(updateData)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ))
      .returning();
    
    return result[0];
  }

  // Quiz and Badge methods
  async checkCertificateEligibility(userId: string): Promise<{ eligible: boolean; coursesCompleted: number; totalCourses: number }> {
    // Get all quiz attempts for the user with passing scores (80%+)
    const passingAttempts = await db
      .select({
        courseId: quizAttempts.courseId,
        score: quizAttempts.score
      })
      .from(quizAttempts)
      .where(and(
        eq(quizAttempts.userId, userId),
        sql`${quizAttempts.score} >= 80`
      ))
      .groupBy(quizAttempts.courseId)
      .having(sql`MAX(${quizAttempts.score}) >= 80`);

    const coursesCompleted = passingAttempts.length;
    const totalCourses = 4; // We have 4 SCORM courses
    
    return {
      eligible: coursesCompleted >= 3, // Need 3 out of 4 courses
      coursesCompleted,
      totalCourses
    };
  }

  async issueCertificate(userId: string): Promise<any> {
    // Check if certificate already exists
    const existingCertificate = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.userId, userId))
      .limit(1);

    if (existingCertificate.length > 0) {
      return existingCertificate[0];
    }

    // Get completed courses for certificate
    const completedCourses = await db
      .select({
        courseId: quizAttempts.courseId,
        courseTitle: courses.title,
        score: sql`MAX(${quizAttempts.score})`.as('maxScore')
      })
      .from(quizAttempts)
      .innerJoin(courses, eq(quizAttempts.courseId, courses.id))
      .where(and(
        eq(quizAttempts.userId, userId),
        sql`${quizAttempts.score} >= 80`
      ))
      .groupBy(quizAttempts.courseId, courses.title)
      .having(sql`MAX(${quizAttempts.score}) >= 80`);

    // Calculate average score
    const totalScore = completedCourses.reduce((sum, course) => sum + Number(course.score), 0);
    const averageScore = totalScore / completedCourses.length;

    // Issue certificate
    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const certificate = {
      id: certificateId,
      userId,
      coursesCompleted: completedCourses.map(c => c.courseTitle).join(', '),
      averageScore: Math.round(averageScore),
      issuedAt: new Date()
    };

    const [result] = await db.insert(courseCertificates).values(certificate).returning();
    return result;
  }
  async getQuizQuestions(courseId: string): Promise<any[]> {
    // Import quiz questions dynamically
    const { quizQuestions } = await import('./quiz-data.js');
    return quizQuestions.filter(q => q.courseId === courseId);
  }

  async createQuizAttempt(attempt: any): Promise<any> {
    const result = await db
      .insert(quizAttempts)
      .values({
        id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: attempt.userId,
        courseId: attempt.courseId,
        answers: JSON.stringify(attempt.answers),
        score: attempt.score,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent || 0
      })
      .returning();
    
    return result[0];
  }

  async getUserQuizAttempts(userId: string, courseId?: string): Promise<any[]> {
    if (courseId) {
      return await db
        .select()
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.courseId, courseId)));
    }

    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));
  }

  async awardBadge(userId: string, courseId: string, quizAttemptId: string): Promise<any> {
    const badgeId = `badge_${courseId}`;
    const result = await db
      .insert(userBadges)
      .values({
        id: `user_badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        badgeId,
        courseId,
        quizAttemptId
      })
      .returning();
    
    return result[0];
  }

  async getUserBadges(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
  }

  async getUserCertificates(userId: string): Promise<any[]> {
    return await db
      .select({
        id: courseCertificates.id,
        userId: courseCertificates.userId,
        coursesCompleted: courseCertificates.coursesCompleted,
        averageScore: courseCertificates.averageScore
      })
      .from(courseCertificates)
      .where(eq(courseCertificates.userId, userId));
  }
  async updateLessonProgress(userId: string, lessonId: string, completed: boolean, timeSpent: number): Promise<Progress> {
    const [existingProgress] = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));

    if (existingProgress) {
      const [updatedProgress] = await db
        .update(progress)
        .set({
          completed,
          completedAt: completed ? new Date() : null,
          timeSpent: (existingProgress.timeSpent || 0) + timeSpent,
        })
        .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)))
        .returning();
      return updatedProgress;
    } else {
      const [newProgress] = await db
        .insert(progress)
        .values({
          id: randomUUID(),
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

  async getLessonProgress(userId: string, lessonId: string): Promise<Progress | undefined> {
    const [progressRecord] = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
    return progressRecord;
  }

  async getCourseProgressStats(userId: string, courseId: string): Promise<{ completedLessons: number; totalLessons: number; totalTimeSpent: number; enrollmentProgress: number; quizCompleted: boolean }> {
    const result = await db
      .select({
        completedLessons: count(sql`CASE WHEN ${progress.completed} = true THEN 1 END`),
        totalLessons: count(lessons.id),
        totalTimeSpent: sum(progress.timeSpent),
      })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .leftJoin(progress, and(eq(progress.lessonId, lessons.id), eq(progress.userId, userId)))
      .where(eq(modules.courseId, courseId));

    // Get enrollment progress
    const enrollment = await this.getEnrollment(userId, courseId);
    const enrollmentProgress = enrollment?.progress || 0;

    // Check if quiz has been completed with passing score
    const quizAttempts = await this.getUserQuizAttempts(userId, courseId);
    const quizCompleted = quizAttempts.some(attempt => attempt.passed);

    return {
      completedLessons: Number(result[0]?.completedLessons || 0),
      totalLessons: Number(result[0]?.totalLessons || 0),
      totalTimeSpent: Number(result[0]?.totalTimeSpent || 0),
      enrollmentProgress,
      quizCompleted,
    };
  }

  // Simplified operations - removed unused features for now

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
      .where(and(eq(enrollments.userId, userId), eq(enrollments.progress, 100)));
    const timeResult = await db
      .select({ total: sum(progress.timeSpent) })
      .from(progress)
      .where(eq(progress.userId, userId));

    return {
      enrolledCourses: enrolledResult[0]?.count || 0,
      completedCourses: completedResult[0]?.count || 0,
      totalTimeSpent: Number(timeResult[0]?.total || 0),
      achievements: 0, // Simplified for now
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

  // Assessment methods
  async getAssessmentsByCourse(courseId: string): Promise<any[]> {
    return await db
      .select()
      .from(assessments)
      .innerJoin(lessons, eq(assessments.lessonId, lessons.id))
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));
  }

  async getQuestionsByAssessment(assessmentId: string): Promise<any[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.lessonId, assessmentId));
  }

  // Achievement methods
  async getAchievements(): Promise<any[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
  }

  // Forum methods
  async createForumPost(post: any): Promise<any> {
    const result = await db
      .insert(forumPosts)
      .values({
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...post
      })
      .returning();
    return result[0];
  }

  async getForumPostsByCourse(courseId: string): Promise<any[]> {
    return await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.courseId, courseId))
      .orderBy(desc(forumPosts.createdAt));
  }
}

export const storage = new DatabaseStorage();
