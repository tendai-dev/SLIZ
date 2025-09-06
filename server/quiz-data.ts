import { QuizQuestion } from '../shared/quiz-types.js';

export const quizQuestions: QuizQuestion[] = [
  // Course 1: Sport Facility and Event Management
  {
    id: 'q1-1',
    courseId: 'scorm-course-1',
    question: 'What is the most important factor when planning a sports facility layout?',
    options: [
      'Aesthetic appeal',
      'Safety and accessibility',
      'Cost minimization',
      'Maximum capacity'
    ],
    correctAnswer: 1,
    explanation: 'Safety and accessibility are paramount in sports facility design to ensure participant welfare and compliance with regulations.'
  },
  {
    id: 'q1-2',
    courseId: 'scorm-course-1',
    question: 'Which certification is typically required for sports facility managers?',
    options: [
      'CPR and First Aid',
      'Business Administration',
      'Engineering Degree',
      'Marketing Certification'
    ],
    correctAnswer: 0,
    explanation: 'CPR and First Aid certification is essential for facility managers to handle medical emergencies.'
  },
  {
    id: 'q1-3',
    courseId: 'scorm-course-1',
    question: 'What is the recommended capacity utilization for optimal facility management?',
    options: [
      '100% at all times',
      '80-85% during peak hours',
      '50% maximum',
      '90-95% consistently'
    ],
    correctAnswer: 1,
    explanation: '80-85% utilization during peak hours allows for safe operations while maximizing revenue.'
  },
  {
    id: 'q1-4',
    courseId: 'scorm-course-1',
    question: 'Which environmental factor is most critical for indoor sports facilities?',
    options: [
      'Natural lighting',
      'Air quality and ventilation',
      'Wall color',
      'Background music'
    ],
    correctAnswer: 1,
    explanation: 'Proper air quality and ventilation are essential for athlete performance and health.'
  },
  {
    id: 'q1-5',
    courseId: 'scorm-course-1',
    question: 'What is the primary purpose of facility risk assessment?',
    options: [
      'Insurance compliance',
      'Preventing accidents and injuries',
      'Meeting building codes',
      'Reducing operational costs'
    ],
    correctAnswer: 1,
    explanation: 'Risk assessment primarily aims to prevent accidents and injuries to facility users.'
  },

  // Course 2: Basic Finance Management
  {
    id: 'q2-1',
    courseId: 'scorm-course-2',
    question: 'What is the most important financial statement for sports organizations?',
    options: [
      'Balance Sheet',
      'Income Statement',
      'Cash Flow Statement',
      'Statement of Equity'
    ],
    correctAnswer: 2,
    explanation: 'Cash flow statement is crucial for sports organizations to manage seasonal revenue fluctuations.'
  },
  {
    id: 'q2-2',
    courseId: 'scorm-course-2',
    question: 'Which budgeting method is best for sports organizations with variable revenue?',
    options: [
      'Fixed budget',
      'Flexible budget',
      'Zero-based budget',
      'Incremental budget'
    ],
    correctAnswer: 1,
    explanation: 'Flexible budgets adapt to revenue changes, which is common in sports organizations.'
  },
  {
    id: 'q2-3',
    courseId: 'scorm-course-2',
    question: 'What percentage of revenue should typically be allocated to emergency reserves?',
    options: [
      '5-10%',
      '15-20%',
      '25-30%',
      '35-40%'
    ],
    correctAnswer: 1,
    explanation: '15-20% reserve fund provides adequate protection against unexpected expenses or revenue drops.'
  },
  {
    id: 'q2-4',
    courseId: 'scorm-course-2',
    question: 'Which financial ratio is most important for measuring organizational efficiency?',
    options: [
      'Current Ratio',
      'Debt-to-Equity Ratio',
      'Return on Investment (ROI)',
      'Quick Ratio'
    ],
    correctAnswer: 2,
    explanation: 'ROI measures how effectively the organization uses its resources to generate returns.'
  },
  {
    id: 'q2-5',
    courseId: 'scorm-course-2',
    question: 'What is the primary benefit of diversified revenue streams in sports organizations?',
    options: [
      'Increased complexity',
      'Higher administrative costs',
      'Risk reduction and stability',
      'Simplified accounting'
    ],
    correctAnswer: 2,
    explanation: 'Diversified revenue streams reduce financial risk and provide more stable income.'
  },

  // Course 3: Sport Marketing
  {
    id: 'q3-1',
    courseId: 'scorm-course-3',
    question: 'What is the most effective marketing strategy for building fan loyalty?',
    options: [
      'Price discounts',
      'Celebrity endorsements',
      'Community engagement',
      'Social media advertising'
    ],
    correctAnswer: 2,
    explanation: 'Community engagement creates emotional connections that build long-term fan loyalty.'
  },
  {
    id: 'q3-2',
    courseId: 'scorm-course-3',
    question: 'Which demographic factor is most important in sports marketing segmentation?',
    options: [
      'Age',
      'Income level',
      'Geographic location',
      'Lifestyle and interests'
    ],
    correctAnswer: 3,
    explanation: 'Lifestyle and interests are the strongest predictors of sports consumption behavior.'
  },
  {
    id: 'q3-3',
    courseId: 'scorm-course-3',
    question: 'What is the primary goal of sports sponsorship activation?',
    options: [
      'Brand awareness',
      'Direct sales',
      'Media coverage',
      'Fan engagement and brand association'
    ],
    correctAnswer: 3,
    explanation: 'Sponsorship activation aims to create meaningful connections between the brand and fans.'
  },
  {
    id: 'q3-4',
    courseId: 'scorm-course-3',
    question: 'Which social media platform is most effective for real-time sports marketing?',
    options: [
      'Facebook',
      'Instagram',
      'Twitter/X',
      'LinkedIn'
    ],
    correctAnswer: 2,
    explanation: 'Twitter/X excels at real-time engagement during live sporting events.'
  },
  {
    id: 'q3-5',
    courseId: 'scorm-course-3',
    question: 'What is the most important metric for measuring sports marketing ROI?',
    options: [
      'Impressions',
      'Engagement rate',
      'Conversion to ticket sales',
      'Social media followers'
    ],
    correctAnswer: 2,
    explanation: 'Conversion to actual sales (tickets, merchandise) provides the clearest ROI measurement.'
  },

  // Course 4: Management of Sport Organizations
  {
    id: 'q4-1',
    courseId: 'scorm-course-4',
    question: 'What leadership style is most effective in sports organizations?',
    options: [
      'Autocratic',
      'Democratic',
      'Situational leadership',
      'Laissez-faire'
    ],
    correctAnswer: 2,
    explanation: 'Situational leadership adapts to different contexts, which is essential in dynamic sports environments.'
  },
  {
    id: 'q4-2',
    courseId: 'scorm-course-4',
    question: 'Which organizational structure works best for professional sports teams?',
    options: [
      'Flat hierarchy',
      'Matrix structure',
      'Functional departments with clear chain of command',
      'Network organization'
    ],
    correctAnswer: 2,
    explanation: 'Clear chain of command ensures quick decision-making and accountability in high-pressure situations.'
  },
  {
    id: 'q4-3',
    courseId: 'scorm-course-4',
    question: 'What is the most critical factor in sports organization strategic planning?',
    options: [
      'Financial projections',
      'Stakeholder alignment',
      'Competitive analysis',
      'Technology adoption'
    ],
    correctAnswer: 1,
    explanation: 'Stakeholder alignment ensures all parties work toward common goals and sustainable success.'
  },
  {
    id: 'q4-4',
    courseId: 'scorm-course-4',
    question: 'Which performance management approach is most suitable for sports organizations?',
    options: [
      'Annual reviews only',
      'Continuous feedback and goal adjustment',
      'Peer evaluation systems',
      'Self-assessment methods'
    ],
    correctAnswer: 1,
    explanation: 'Continuous feedback allows for real-time performance optimization in fast-paced sports environments.'
  },
  {
    id: 'q4-5',
    courseId: 'scorm-course-4',
    question: 'What is the primary challenge in managing volunteer staff in sports organizations?',
    options: [
      'Payment issues',
      'Skill development',
      'Motivation and retention',
      'Legal compliance'
    ],
    correctAnswer: 2,
    explanation: 'Keeping volunteers motivated and engaged is crucial since they are not financially compensated.'
  }
];
