import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { CourseCard } from '@/components/course-card';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import { Search, Filter, BookOpen, Clock, Users, Star } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  instructorId: string;
  difficulty: string;
  duration: number;
  price: string;
  isPublished: boolean;
  createdAt: string;
}

export default function Courses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const { data: enrollments = [] } = useQuery<any[]>({
    queryKey: ['/api/enrollments/my'],
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
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

  const filteredCourses = courses.filter((course: Course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const difficulties = ['Foundation', 'Intermediate', 'Advanced', 'Professional'];

  const isEnrolled = (courseId: string) => {
    return enrollments.some((enrollment: any) => enrollment.courseId === courseId);
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find((e: any) => e.courseId === courseId);
    return enrollment ? Math.round(parseFloat(enrollment.progress) || 0) : 0;
  };

  if (coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        isAuthenticated={!!user}
        user={user}
        onSignOut={handleSignOut}
      />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl md:text-6xl mb-4">
            <span className="text-gradient">Master Sports Leadership</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our comprehensive collection of courses designed to elevate your sports leadership skills
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-courses"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDifficulty === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty('')}
                  data-testid="filter-all"
                >
                  All Levels
                </Button>
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    data-testid={`filter-${difficulty.toLowerCase()}`}
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card text-center p-4">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary" data-testid="stat-total-courses">
              {courses.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Courses</div>
          </Card>
          
          <Card className="glass-card text-center p-4">
            <Users className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent" data-testid="stat-enrolled-courses">
              {enrollments.length}
            </div>
            <div className="text-sm text-muted-foreground">Your Enrollments</div>
          </Card>
          
          <Card className="glass-card text-center p-4">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary" data-testid="stat-total-duration">
              {courses.reduce((acc: number, course: Course) => acc + (course.duration || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Weeks</div>
          </Card>
          
          <Card className="glass-card text-center p-4">
            <Star className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent" data-testid="stat-average-rating">
              4.8
            </div>
            <div className="text-sm text-muted-foreground">Avg. Rating</div>
          </Card>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">
              Showing {filteredCourses.length} of {courses.length} courses
            </span>
            {(searchQuery || selectedDifficulty) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('');
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course: Course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                imageUrl={course.imageUrl}
                difficulty={course.difficulty}
                duration={`${course.duration} weeks`}
                students={0} // Would need to fetch from enrollment count
                rating={4.8}
                progress={isEnrolled(course.id) ? getEnrollmentProgress(course.id) : 0}
                onEnroll={() => {
                  if (!user) {
                    window.location.href = '/api/login';
                    return;
                  }
                  if (isEnrolled(course.id)) {
                    // Navigate to course detail
                    window.location.href = `/courses/${course.id}`;
                  } else {
                    enrollMutation.mutate(course.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedDifficulty
                  ? "Try adjusting your search or filters"
                  : "No courses are currently available"}
              </p>
              {(searchQuery || selectedDifficulty) && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDifficulty('');
                  }}
                  data-testid="button-clear-all-filters"
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
