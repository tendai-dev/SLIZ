import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Trophy, Medal, Star } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizInterfaceProps {
  courseId: string;
  courseTitle: string;
  onComplete?: (score: number, passed: boolean) => void;
}

export function QuizInterface({ courseId, courseTitle, onComplete }: QuizInterfaceProps) {
  const { user } = useUser();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, [courseId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, showResults]);

  const fetchQuizQuestions = async () => {
    try {
      const response = await fetch(`/api/quiz/${courseId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Failed to fetch quiz questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${courseId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: selectedAnswers,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setScore(result.score);
        setShowResults(true);
        onComplete?.(result.score, result.passed);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const passed = score >= 80;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <Card className="glass-card max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">
            {courseTitle} - Quiz Assessment
          </CardTitle>
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>30 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>{questions.length} questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>80% to pass</span>
              </div>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                You need to score 80% or higher to earn your digital badge and certificate eligibility.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => setQuizStarted(true)}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="glass-card max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {passed ? (
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-display mb-2">
            Quiz {passed ? 'Completed Successfully!' : 'Not Passed'}
          </CardTitle>
          <div className="text-4xl font-bold text-primary mb-4">{score}%</div>
          {passed ? (
            <Badge className="bg-gradient-to-r from-primary to-accent text-white">
              <Medal className="w-4 h-4 mr-2" />
              Badge Earned!
            </Badge>
          ) : (
            <Badge variant="secondary">
              Minimum 80% required to pass
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-card rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{selectedAnswers.filter((answer, index) => answer === questions[index]?.correctAnswer).length}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="bg-card rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">{questions.length}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
          </div>
          
          {passed && (
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-primary font-medium">
                🎉 Congratulations! You've earned a digital badge for this course.
                Complete 3 out of 4 courses to receive your certificate!
              </p>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retake Quiz
            </Button>
            <Button 
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-primary to-accent text-background"
            >
              Back to Course
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-semibold">{courseTitle}</h2>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={timeLeft < 300 ? 'text-destructive font-semibold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant="outline">
                {selectedAnswers.filter(answer => answer !== undefined).length} / {questions.length} answered
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedAnswers[currentQuestionIndex] === index
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-primary bg-primary text-white'
                    : 'border-border'
                }`}>
                  {selectedAnswers[currentQuestionIndex] === index && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          ))}

          {showExplanation && currentQuestion && (
            <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h4 className="font-semibold text-accent mb-2">Explanation:</h4>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowExplanation(!showExplanation)}
                variant="outline"
                size="sm"
              >
                {showExplanation ? 'Hide' : 'Show'} Explanation
              </Button>
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={selectedAnswers.filter(answer => answer !== undefined).length !== questions.length}
                className="bg-gradient-to-r from-primary to-accent text-background"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
