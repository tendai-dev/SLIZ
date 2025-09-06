import { Router } from 'express';
import { storage } from './storage.js';

const router = Router();

// Get quiz questions for a course
router.get('/api/quiz/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const questions = await storage.getQuizQuestions(courseId);
    
    // Remove correct answers from response for security
    const questionsForClient = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));
    
    res.json(questionsForClient);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});

// Submit quiz attempt
router.post('/api/quiz/:courseId/submit', async (req: any, res) => {
  try {
    const { courseId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.auth?.userId || 'dev-user-1';
    
    // Get correct answers
    const questions = await storage.getQuizQuestions(courseId);
    
    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer: number, index: number) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 80; // 80% pass requirement
    
    // Create quiz attempt record
    const attempt = await storage.createQuizAttempt({
      userId,
      courseId,
      answers,
      score,
      passed,
      timeSpent: timeSpent || 0
    });
    
    // Award badge if passed
    let certificate = null;
    if (passed) {
      try {
        // Award badge
        const badge = await storage.awardBadge(userId, courseId, attempt.id);
        console.log('Badge awarded:', badge);
        
        // Update course progress to 100% when quiz is passed
        await storage.updateEnrollmentProgress(userId, courseId, 100);
        console.log('Course progress updated to 100% after quiz completion');
        
        // Check certificate eligibility
        const eligibility = await storage.checkCertificateEligibility(userId);
        if (eligibility.eligible) {
          certificate = await storage.issueCertificate(userId);
          console.log('Certificate issued:', certificate);
        }
      } catch (error) {
        console.error('Error awarding badge or certificate:', error);
        // Continue even if certificate fails
      }
    }
    
    res.json({
      score,
      passed,
      correctAnswers,
      totalQuestions: questions.length,
      explanations: questions.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      })),
      badgeEarned: passed,
      certificateEarned: !!certificate,
      certificate
    });
    
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user's quiz attempts
router.get('/api/quiz-attempts', async (req: any, res) => {
  try {
    const userId = req.auth?.userId || 'dev-user-1';
    const attempts = await storage.getUserQuizAttempts(userId);
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

// Get user's badges
router.get('/api/badges', async (req: any, res) => {
  try {
    const userId = req.auth?.userId || 'dev-user-1';
    const badges = await storage.getUserBadges(userId);
    
    // Add badge metadata
    const badgesWithMetadata = badges.map(badge => ({
      ...badge,
      name: getBadgeName(badge.badgeId),
      description: getBadgeDescription(badge.badgeId),
      imageUrl: getBadgeImageUrl(badge.badgeId),
      issuer: getBadgeIssuer(badge.badgeId)
    }));
    
    res.json(badgesWithMetadata);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get user's certificates
router.get('/api/certificates', async (req: any, res) => {
  try {
    const userId = req.auth?.userId || 'dev-user-1';
    const certificates = await storage.getUserCertificates(userId);
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Helper functions for badge metadata
function getBadgeName(badgeId: string): string {
  const courseNames = {
    'badge_scorm-course-1': 'Sport Facility and Event Management Badge',
    'badge_scorm-course-2': 'Basic Finance Management Badge',
    'badge_scorm-course-3': 'Sport Marketing Badge',
    'badge_scorm-course-4': 'Management of Sport Organizations Badge'
  };
  return courseNames[badgeId as keyof typeof courseNames] || 'Course Badge';
}

function getBadgeDescription(badgeId: string): string {
  const descriptions = {
    'badge_scorm-course-1': 'Completed Sport Facility and Event Management course with 80%+ score',
    'badge_scorm-course-2': 'Completed Basic Finance Management course with 80%+ score',
    'badge_scorm-course-3': 'Completed Sport Marketing course with 80%+ score',
    'badge_scorm-course-4': 'Completed Management of Sport Organizations course with 80%+ score'
  };
  return descriptions[badgeId as keyof typeof descriptions] || 'Course completion badge';
}

function getBadgeImageUrl(badgeId: string): string {
  // You can customize these URLs to point to actual badge images
  return '/badges/sliz-badge.png';
}

function getBadgeIssuer(badgeId: string): string {
  return Math.random() > 0.5 ? 'West Virginia University' : 'SLIZ';
}

export default router;
