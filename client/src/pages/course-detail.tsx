import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  CheckCircle, 
  Circle,
  MessageCircle,
  Award,
  Calendar,
  Trophy,
  Medal,
  Video,
  Rocket
} from 'lucide-react';

export default function CourseDetail() {
  const [, params] = useRoute('/courses/:id');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const courseId = params?.id;

  const { data: course, isLoading: courseLoading } = useQuery<any>({
    queryKey: ['/api/courses', courseId],
    enabled: !!courseId,
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery<any[]>({
    queryKey: ['/api/courses', courseId, 'modules'],
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ['/api/enrollments/my'],
    enabled: !!user,
    select: (data: any[]) => data.find(e => e.courseId === courseId),
  });

  const { data: progressStats } = useQuery<any>({
    queryKey: ['/api/courses', courseId, 'progress'],
    enabled: !!user && !!enrollment,
  });

  const { data: forumPosts = [] } = useQuery<any[]>({
    queryKey: ['/api/courses', courseId, 'forum'],
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/enrollments', {
        courseId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments/my'] });
      toast({
        title: "Enrolled Successfully!",
        description: "You have been enrolled in the course.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  const isEnrolled = !!enrollment;
  const progress = Math.round(parseFloat(enrollment?.progress || '0'));

  if (courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-20 mt-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="glass-card mb-6">
              <div className="relative h-64 rounded-t-2xl overflow-hidden">
                <img 
                  src={course.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
                  alt={course.title}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary/90 backdrop-blur text-primary-foreground">
                    {course.difficulty}
                  </Badge>
                </div>
                {isEnrolled && (
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center space-x-2 text-white">
                      <Progress value={progress} className="w-32" />
                      <span className="text-sm font-semibold">{progress}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h1 className="font-display font-bold text-3xl md:text-4xl mb-4" data-testid="course-title">
                  {course.title}
                </h1>
                
                <p className="text-muted-foreground text-lg mb-6" data-testid="course-description">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center" data-testid="course-duration">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration} weeks
                  </div>
                  <div className="flex items-center" data-testid="course-students">
                    <Users className="w-4 h-4 mr-1" />
                    0 students enrolled
                  </div>
                  <div className="flex items-center" data-testid="course-rating">
                    <Star className="w-4 h-4 mr-1 text-accent fill-accent" />
                    4.8 rating
                  </div>
                  <div className="flex items-center" data-testid="course-lessons">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {modules.reduce((acc: number, module: any) => acc + (module.lessons?.length || 0), 0)} lessons
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollment Card */}
          <div>
            <Card className="glass-card sticky top-24">
              <CardContent className="p-6">
                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2" data-testid="enrollment-progress">
                        {progress}%
                      </div>
                      <p className="text-muted-foreground">Course Progress</p>
                      <Progress value={progress} className="mt-2" />
                    </div>
                    
                    {progressStats && (
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="text-center">
                            <div className="text-xl font-semibold text-primary" data-testid="completion-rate">
                              {progressStats.enrollmentProgress}%
                            </div>
                            <div className="text-xs text-muted-foreground">Course Progress</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold text-accent" data-testid="lessons-completed">
                              {progressStats.completedLessons}/{progressStats.totalLessons}
                            </div>
                            <div className="text-xs text-muted-foreground">Lessons</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold text-primary" data-testid="study-time">
                              {Math.round(progressStats.totalTimeSpent / 60)}h
                            </div>
                            <div className="text-xs text-muted-foreground">Study Time</div>
                          </div>
                        </div>
                        
                        {progressStats.quizCompleted && (
                          <div className="bg-primary/10 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center space-x-2 text-primary">
                              <Trophy className="w-4 h-4" />
                              <span className="text-sm font-medium">Quiz Completed - Badge Earned!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full glass-card neon-border text-foreground font-semibold hover:shadow-lg transition-all"
                        onClick={() => window.location.href = `/quiz/${courseId}`}
                        disabled={progressStats?.quizCompleted}
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        {progressStats?.quizCompleted ? 'Quiz Completed ✓' : 'Take Quiz & Earn Badge'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    {course.price && (
                      <div className="text-3xl font-bold text-foreground" data-testid="course-price">
                        ${course.price}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent font-semibold"
                      onClick={() => {
                        if (!user) {
                          window.location.href = '/api/login';
                          return;
                        }
                        enrollMutation.mutate();
                      }}
                      disabled={enrollMutation.isPending}
                      data-testid="button-enroll-course"
                    >
                      {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                    </Button>

                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        Lifetime access
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        Certificate of completion
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                        Discussion forums
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content Tabs */}
        <Tabs defaultValue="curriculum" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curriculum" data-testid="tab-curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="discussions" data-testid="tab-discussions">Discussions</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curriculum" className="mt-6">
            <div className="space-y-4">
              {modules.map((module: any, moduleIndex: number) => (
                <Card key={module.id} className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-sm font-semibold">
                        {moduleIndex + 1}
                      </div>
                      <span data-testid={`module-title-${module.id}`}>{module.title}</span>
                    </CardTitle>
                    {module.description && (
                      <p className="text-muted-foreground" data-testid={`module-description-${module.id}`}>
                        {module.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Placeholder lessons - would fetch from API */}
                      {[1, 2, 3].map((lessonIndex) => (
                        <div key={lessonIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer">
                          <Circle className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium" data-testid={`lesson-title-${module.id}-${lessonIndex}`}>
                              Lesson {lessonIndex}: Introduction to {module.title}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-2">
                              <Clock className="w-3 h-3" />
                              <span>15 minutes</span>
                            </div>
                          </div>
                          {!isEnrolled && (
                            <Badge variant="secondary" className="text-xs">
                              Preview
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="discussions" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Course Discussions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEnrolled ? (
                  forumPosts.length > 0 ? (
                    <div className="space-y-4">
                      {forumPosts.map((post: any) => (
                        <div key={post.id} className="p-4 glass-card rounded-lg">
                          <h4 className="font-semibold mb-2">{post.title}</h4>
                          <p className="text-muted-foreground text-sm mb-2">{post.content}</p>
                          <div className="text-xs text-muted-foreground">
                            Posted {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No discussions yet. Be the first to start a conversation!</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Join the course to participate in discussions</p>
                    <Button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
                      Enroll Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Student Reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
