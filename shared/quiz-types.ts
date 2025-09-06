export interface QuizQuestion {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  answers: number[]; // Array of selected option indices
  score: number; // Percentage score (0-100)
  passed: boolean; // True if score >= 80%
  completedAt: Date;
  timeSpent: number; // Time in seconds
}

export interface Badge {
  id: string;
  courseId: string;
  name: string;
  description: string;
  imageUrl: string;
  issuer: 'West Virginia University' | 'SLIZ';
  requirements: {
    minScore: number; // 80% for all courses
    courseCompletion: boolean;
  };
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  quizAttemptId: string;
}

export interface Certificate {
  id: string;
  userId: string;
  name: string;
  description: string;
  issuedAt: Date;
  coursesCompleted: string[]; // Array of course IDs
  totalScore: number; // Average score across completed courses
  imageUrl: string;
}
