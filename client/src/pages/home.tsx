import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { CourseCard } from '@/components/course-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, BookOpen, Award } from 'lucide-react';
import { Link } from 'wouter';

export default function Home() {
  const { user } = useAuth();
  
  const { data: courses = [], isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ['/api/courses'],
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<any[]>({
    queryKey: ['/api/enrollments/my'],
  });

  const { data: stats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/dashboard/student'],
  });

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  if (coursesLoading || enrollmentsLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Welcome back, {(user as any)?.firstName || 'Student'}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Continue your journey to sports leadership excellence
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-enrolled-courses">
                {stats.enrolledCourses || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent" data-testid="stat-completed-courses">
                {stats.completedCourses || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-study-hours">
                {Math.round((stats.totalTimeSpent || 0) / 60)}h
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent" data-testid="stat-achievements">
                {stats.achievements || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {/* My Enrollments */}
            <Card className="glass-card mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-display">Continue Learning</CardTitle>
                <Link href="/dashboard/student">
                  <Button variant="outline" size="sm" data-testid="button-view-dashboard">
                    View Dashboard
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 3).map((enrollment: any) => (
                      <div key={enrollment.id} className="flex items-center space-x-4 p-4 glass-card rounded-xl hover:bg-primary/5 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold" data-testid={`course-title-${enrollment.id}`}>
                            Course Title
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            Progress: {Math.round(parseFloat(enrollment.progress) || 0)}%
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" 
                                style={{ width: `${Math.round(parseFloat(enrollment.progress) || 0)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-primary font-semibold">
                              {Math.round(parseFloat(enrollment.progress) || 0)}%
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                    <Link href="/courses">
                      <Button data-testid="button-browse-courses">Browse Courses</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {/* Quick Links */}
            <Card className="glass-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/courses">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-explore-courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
                <Link href="/dashboard/student">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-my-progress">
                    <Trophy className="w-4 h-4 mr-2" />
                    My Progress
                  </Button>
                </Link>
                {(user as any)?.role === 'instructor' && (
                  <Link href="/dashboard/instructor">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-instructor-dashboard">
                      <Award className="w-4 h-4 mr-2" />
                      Instructor Dashboard
                    </Button>
                  </Link>
                )}
                {(user as any)?.role === 'admin' && (
                  <Link href="/dashboard/admin">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-admin-dashboard">
                      <Award className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Featured Courses</h2>
            <Link href="/courses">
              <Button variant="outline" data-testid="button-view-all-courses">
                View All Courses
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses
              .sort((a: any, b: any) => {
                // Sort by course ID number to ensure order 1-4
                const numA = parseInt(a.id.replace('scorm-course-', ''));
                const numB = parseInt(b.id.replace('scorm-course-', ''));
                return numA - numB;
              })
              .slice(0, 4)
              .map((course: any) => {
                // Map course IDs to appropriate images
                const courseImages: Record<string, string> = {
                  "scorm-course-1": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                  "scorm-course-2": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                  "scorm-course-3": "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                  "scorm-course-4": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                };
                
                return (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description || 'SCORM course content'}
                    imageUrl={courseImages[course.id] || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                    difficulty={course.difficulty || 'Foundation'}
                    duration={course.duration ? `${course.duration} weeks` : 'Self-paced'}
                    students={0}
                    rating={4.8}
                    progress={0}
                    onEnroll={() => {
                      // Handle enrollment
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
