import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupClerkAuth, requireAuth, withAuth, getCurrentUser } from "./clerk-auth";
import { ScormIntegration } from "./scorm-integration";
import { initializeScormCategory } from "./init-scorm";
import { insertCourseSchema, insertModuleSchema, insertLessonSchema, insertEnrollmentSchema } from "@shared/schema";
import { z } from "zod";
import * as path from "path";
import express from "express";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize SCORM integration
  const scormIntegration = new ScormIntegration();
  
  // Serve static SCORM content
  app.use('/scorm-courses', express.static(path.join(__dirname, 'public', 'scorm-courses')));
  
  // Auth middleware
  await setupClerkAuth(app);

  // Initialize SCORM category and courses
  try {
    await initializeScormCategory();
    await scormIntegration.initializeScormCourses();
  } catch (error) {
    console.error('Failed to initialize SCORM system:', error);
  }

  // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', requireAuth, async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const course = await storage.createCourse({
        ...courseData,
        instructorId: userId,
      });
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create course" });
      }
    }
  });

  app.get('/api/courses/:courseId/modules', async (req, res) => {
    try {
      const modules = await storage.getModulesByCourse(req.params.courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.post('/api/courses/:courseId/modules', requireAuth, async (req: any, res) => {
    try {
      const moduleData = insertModuleSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Check if user is instructor of the course
      const course = await storage.getCourse(req.params.courseId);
      if (!course || (course.instructorId !== userId && req.user.claims.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const module = await storage.createModule({
        ...moduleData,
        courseId: req.params.courseId,
      });
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create module" });
      }
    }
  });

  app.get('/api/modules/:moduleId/lessons', async (req, res) => {
    try {
      const lessons = await storage.getLessonsByModule(req.params.moduleId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.post('/api/modules/:moduleId/lessons', requireAuth, async (req: any, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Check permissions (simplified - would need to check through module -> course -> instructor)
      const lesson = await storage.createLesson({
        ...lessonData,
        moduleId: req.params.moduleId,
      });
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lesson" });
      }
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', requireAuth, async (req: any, res) => {
    try {
      // Accept only courseId from the client and attach the authed userId
      const { courseId } = z.object({ courseId: z.string() }).parse(req.body);
      const userId = req.user.claims.sub;

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(userId, courseId);
      if (existingEnrollment) {
        return res.status(200).json(existingEnrollment);
      }

      const enrollment = await storage.enrollUser({
        userId,
        courseId,
        progress: 0,
      });
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to enroll" });
      }
    }
  });

  app.get('/api/enrollments/my', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByUser(userId);

      // Enrich enrollment records with course details for the dashboard
      const detailed = await Promise.all(
        enrollments.map(async (e) => {
          const course = await storage.getCourse(e.courseId);
          return {
            id: e.courseId,
            title: course?.title ?? 'Course',
            description: course?.description ?? '',
            imageUrl: (course as any)?.imageUrl ?? undefined,
            progress: Number(e.progress ?? 0),
            completed: Number(e.progress ?? 0) >= 100 || !!e.completedAt,
            enrolledAt: e.enrolledAt,
            lastAccessed: e.completedAt ?? e.enrolledAt,
          };
        })
      );

      res.json(detailed);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Progress tracking routes
  app.post('/api/lessons/:lessonId/progress', requireAuth, async (req: any, res) => {
    try {
      const { completed, timeSpent } = req.body;
      const userId = req.user.claims.sub;
      
      const progress = await storage.updateLessonProgress(userId, req.params.lessonId, completed, timeSpent);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.get('/api/courses/:courseId/progress', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getCourseProgressStats(userId, req.params.courseId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/student', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/instructor', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const stats = await storage.getInstructorStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
      res.status(500).json({ message: "Failed to fetch instructor stats" });
    }
  });

  app.get('/api/dashboard/admin', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Assessment routes
  app.get('/api/courses/:courseId/assessments', async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByCourse(req.params.courseId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get('/api/assessments/:assessmentId/questions', async (req, res) => {
    try {
      const questions = await storage.getQuestionsByAssessment(req.params.assessmentId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Forum routes
  app.get('/api/courses/:courseId/forum', async (req, res) => {
    try {
      const posts = await storage.getForumPostsByCourse(req.params.courseId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.post('/api/courses/:courseId/forum', requireAuth, async (req: any, res) => {
    try {
      const { title, content, parentId } = req.body;
      const userId = req.user.claims.sub;
      
      const post = await storage.createForumPost({
        title,
        content,
        parentId,
        courseId: req.params.courseId,
        userId,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/achievements/my', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // Removed duplicate enrollment endpoints to avoid confusion. Use
  // POST /api/enrollments and GET /api/enrollments/my instead.

  // SCORM API endpoints
  app.post('/api/scorm/launch', requireAuth, async (req, res) => {
    const { courseId, launchUrl } = req.body;
    console.log(`SCORM course launched: ${courseId} at ${launchUrl}`);
    res.json({ success: true });
  });

  app.post('/api/scorm/close', requireAuth, async (req: any, res) => {
    try {
      const { courseId } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`User ${userId} closed SCORM course ${courseId}`);
      res.json({ success: true, message: "SCORM course closed" });
    } catch (error) {
      console.error("Error closing SCORM course:", error);
      res.status(500).json({ message: "Failed to close SCORM course" });
    }
  });

  // Get available SCORM courses
  app.get('/api/scorm/courses', async (req, res) => {
    try {
      const scormCourses = await scormIntegration.getScormCoursesList();
      res.json(scormCourses);
    } catch (error) {
      console.error("Error fetching SCORM courses:", error);
      res.status(500).json({ message: "Failed to fetch SCORM courses" });
    }
  });

  const server = createServer(app);
  return server;
}
