import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { apiRequest } from '@/lib/queryClient';
import { 
  BookOpen, 
  Users, 
  Star, 
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // Redirect if not instructor
  useEffect(() => {
    if (user && user.role !== 'instructor' && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the instructor dashboard.",
        variant: "destructive",
      });
      window.location.href = '/';
    }
  }, [user, toast]);

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/instructor'],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: myCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses/instructor', user?.id],
    enabled: !!user?.id,
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const response = await apiRequest('POST', '/api/courses', courseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses/instructor'] });
      setIsCreatingCourse(false);
      toast({
        title: "Course Created!",
        description: "Your new course has been created successfully.",
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
        title: "Failed to Create Course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    createCourseMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      difficulty: formData.get('difficulty') || 'Foundation',
      duration: parseInt(formData.get('duration') as string) || 4,
      categoryId: '1', // Default category - would be selectable in production
      price: formData.get('price') || '0',
      isPublished: false,
    });
  };

  if (statsLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return null;
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your courses and track student progress
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary to-accent"
            onClick={() => setIsCreatingCourse(true)}
            data-testid="button-create-course"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-total-courses">
                {stats.totalCourses || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active and draft courses</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent" data-testid="stat-total-students">
                {stats.totalStudents || 0}
              </div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-avg-rating">
                {stats.avgRating || 4.8}
              </div>
              <p className="text-xs text-muted-foreground">From student reviews</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent" data-testid="stat-total-revenue">
                ${stats.totalRevenue || 0}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Creation Modal */}
        {isCreatingCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="glass-card w-full max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Create New Course</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingCourse(false)}
                    data-testid="button-close-create-course"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Course Title</label>
                    <Input
                      name="title"
                      placeholder="Enter course title..."
                      required
                      data-testid="input-course-title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      name="description"
                      placeholder="Enter course description..."
                      required
                      rows={4}
                      data-testid="input-course-description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                      <select 
                        name="difficulty" 
                        className="w-full p-2 rounded-lg bg-input border border-border"
                        data-testid="select-course-difficulty"
                      >
                        <option value="Foundation">Foundation</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Duration (weeks)</label>
                      <Input
                        name="duration"
                        type="number"
                        min="1"
                        max="52"
                        defaultValue="4"
                        required
                        data-testid="input-course-duration"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price ($)</label>
                    <Input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="0"
                      data-testid="input-course-price"
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-primary to-accent"
                      disabled={createCourseMutation.isPending}
                      data-testid="button-submit-create-course"
                    >
                      {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsCreatingCourse(false)}
                      data-testid="button-cancel-create-course"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Courses */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-display">My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {myCourses.length > 0 ? (
                  <div className="space-y-4">
                    {myCourses.map((course: any) => (
                      <div key={course.id} className="flex items-center space-x-4 p-4 glass-card rounded-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg" data-testid={`course-title-${course.id}`}>
                            {course.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{course.duration} weeks</span>
                            <Badge variant={course.isPublished ? "default" : "secondary"}>
                              {course.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-view-${course.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-edit-${course.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first course to start teaching students
                    </p>
                    <Button 
                      onClick={() => setIsCreatingCourse(true)}
                      data-testid="button-create-first-course"
                    >
                      Create Your First Course
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">New student enrolled in Leadership Fundamentals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-muted-foreground">Course rating updated to 4.9 stars</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Student completed Team Management module</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-manage-students">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Students
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-schedule-session">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-course-resources">
                  <Award className="w-4 h-4 mr-2" />
                  Course Resources
                </Button>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">New Enrollments</span>
                    <span className="font-semibold text-primary" data-testid="monthly-enrollments">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Course Completions</span>
                    <span className="font-semibold text-accent" data-testid="monthly-completions">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <span className="font-semibold text-primary" data-testid="monthly-revenue">$480</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Rating</span>
                    <span className="font-semibold text-accent" data-testid="monthly-rating">4.8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
