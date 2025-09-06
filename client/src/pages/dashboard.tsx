import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { ScormPlayer } from '@/components/scorm-player';
import { Play, BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useApiRequest } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  progress: number;
  lastAccessed?: string;
  completed: boolean;
}

export default function Dashboard() {
  const { isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/enrollments/my');
      return response.json();
    },
    enabled: isSignedIn,
    refetchInterval: 5000, // Refresh every 5 seconds to get updated progress
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/courses');
      return res.json();
    },
    enabled: isSignedIn,
  });

  // Build a view model for enrolled courses by joining enrollment records with course metadata
  const myCourses: EnrolledCourse[] = (enrolledCourses as any[]).map((e: any) => {
    const course = (allCourses as any[]).find((c) => c.id === e.courseId);
    return {
      id: e.courseId,
      title: course?.title || 'Course',
      description: course?.description || '',
      imageUrl: course?.imageUrl,
      progress: Number(e.progress || 0),
      completed: Number(e.progress || 0) >= 100 || !!e.completedAt,
      lastAccessed: e.completedAt || e.enrolledAt,
    } as EnrolledCourse;
  });
  
  // Remove duplicates and ensure unique course IDs
  const enrolledIds = new Set((enrolledCourses as any[]).map((e: any) => e.courseId));
  const availableCourses = (allCourses as any[])
    .filter((c) => !enrolledIds.has(c.id))
    .filter((course, index, self) => 
      index === self.findIndex((c) => c.id === course.id)
    );

  const handleLaunchCourse = (course: EnrolledCourse) => {
    setSelectedCourse(course);
    setIsPlayerOpen(true);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const res = await apiRequest('POST', '/api/enrollments', { courseId });
      await queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
      await queryClient.invalidateQueries({ queryKey: ['all-courses'] });
    } catch (error: any) {
      console.error("Dashboard enrollment error details:", {
        message: error?.message,
        status: error?.status,
        courseId
      });
    }
  };

  // Sport-specific thumbnail images for each course
  const courseImages = {
    "s-l-i-z-micro-course-1-sport-facility-and-event-management-scorm12-QOrGCF5z": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", // Stadium/sports facility
    "s-l-i-z-micro-course-2-basic-finance-management-scorm12-D24iHB-D": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", // Finance/money management
    "s-l-i-z-micro-course-3-sport-marketing-scorm12-LpQGKIfD": "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", // Sports marketing/branding
    "s-l-i-z-micro-course-4-management-of-sport-organizations-scorm12-wrUhSRL8": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" // Team management/leadership
  };

  // Map course IDs to actual SCORM folder names
  const coursePathMap: Record<string, string> = {
    "scorm-course-1": "s-l-i-z-micro-course-1-sport-facility-and-event-management-scorm12-QOrGCF5z",
    "scorm-course-2": "s-l-i-z-micro-course-2-basic-finance-management-scorm12-D24iHB-D",
    "scorm-course-3": "s-l-i-z-micro-course-3-sport-marketing-scorm12-LpQGKIfD",
    "scorm-course-4": "s-l-i-z-micro-course-4-management-of-sport-organizations-scorm12-wrUhSRL8"
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navigation />
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground">You need to be signed in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.firstName || 'Student'}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">
            Continue your sports management journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-muted-foreground text-sm">Enrolled Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrolledCourses.filter((c: any) => c.completed).length}
                  </p>
                  <p className="text-muted-foreground text-sm">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(enrolledCourses.reduce((acc: number, c: any) => acc + (c.progress || 0), 0) / Math.max(enrolledCourses.length, 1))}%
                  </p>
                  <p className="text-muted-foreground text-sm">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {enrolledCourses.filter((c: any) => !c.completed).length}
                  </p>
                  <p className="text-muted-foreground text-sm">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">My Courses</h2>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="glass-card animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <Card className="glass-card text-center p-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your learning journey by enrolling in a course from our catalog.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course: any, index: number) => (
                <Card key={`enrolled-${course.id}-${index}`} className="glass-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={courseImages[coursePathMap[course.id] as keyof typeof courseImages] || course.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-end">
                        <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          SCORM Course
                        </span>
                        {course.completed && (
                          <Trophy className="h-6 w-6 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gradient">{course.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleLaunchCourse(course)}
                      className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {course.completed ? 'Review Course' : 'Continue Learning'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses to Enroll */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Available Courses</h2>
          {availableCourses.length === 0 ? (
            <p className="text-muted-foreground">You're enrolled in all available courses. Great job!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course: any, index: number) => (
                <Card key={`available-${course.id}-${index}`} className="glass-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={courseImages[coursePathMap[course.id] as keyof typeof courseImages] || course.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&h=300"} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gradient">{course.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>
                    <Button 
                      onClick={() => handleEnroll(course.id)}
                      className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Enroll
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SCORM Player */}
      {selectedCourse && (
        <ScormPlayer
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          launchUrl={`/scorm-courses/${coursePathMap[selectedCourse.id] || selectedCourse.id}/scormcontent/index.html`}
          isOpen={isPlayerOpen}
          onClose={() => {
            setIsPlayerOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}
