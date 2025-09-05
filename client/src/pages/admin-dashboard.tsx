import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  GraduationCap,
  Shield,
  Settings,
  BarChart3,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      window.location.href = '/';
    }
  }, [user, toast]);

  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/admin'],
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

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses'],
  });

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  if (statsLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Mock user data for demonstration
  const mockUsers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'student',
      createdAt: '2024-01-15',
      isActive: true,
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'instructor',
      createdAt: '2024-01-10',
      isActive: true,
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      role: 'student',
      createdAt: '2024-01-20',
      isActive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        isAuthenticated={!!user}
        user={user}
        onSignOut={handleSignOut}
      />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage users, courses, and platform settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-total-users">
                {stats.totalUsers || 156}
              </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent" data-testid="stat-total-courses">
                {stats.totalCourses || courses.length}
              </div>
              <p className="text-xs text-muted-foreground">+3 new this month</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="stat-total-enrollments">
                {stats.totalEnrollments || 342}
              </div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-display">User Management</CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                        data-testid="input-search-users"
                      />
                    </div>
                    <Button data-testid="button-add-user">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers
                    .filter(user => 
                      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((userData) => (
                    <div key={userData.id} className="flex items-center space-x-4 p-4 glass-card rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`user-name-${userData.id}`}>
                          {userData.firstName} {userData.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`user-email-${userData.id}`}>
                          {userData.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={userData.role === 'admin' ? 'default' : userData.role === 'instructor' ? 'secondary' : 'outline'}
                            data-testid={`user-role-${userData.id}`}
                          >
                            {userData.role}
                          </Badge>
                          <Badge 
                            variant={userData.isActive ? 'default' : 'secondary'}
                            className={userData.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                            data-testid={`user-status-${userData.id}`}
                          >
                            {userData.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground" data-testid={`user-date-${userData.id}`}>
                          Joined {new Date(userData.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-view-user-${userData.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-edit-user-${userData.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-display">Course Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.map((course: any) => (
                    <div key={course.id} className="flex items-center space-x-4 p-4 glass-card rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg" data-testid={`course-title-${course.id}`}>
                          {course.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`course-description-${course.id}`}>
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{course.duration} weeks</span>
                          <span>{course.difficulty}</span>
                          <Badge 
                            variant={course.isPublished ? "default" : "secondary"}
                            data-testid={`course-status-${course.id}`}
                          >
                            {course.isPublished ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" data-testid={`button-view-course-${course.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-edit-course-${course.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!course.isPublished && (
                          <Button 
                            size="sm" 
                            className="bg-primary/20 text-primary hover:bg-primary/30"
                            data-testid={`button-approve-course-${course.id}`}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>User Growth</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                      <p>User growth analytics would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Course Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                      <p>Course performance metrics would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Platform Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Platform Name</label>
                      <Input defaultValue="SLIZ Academy" data-testid="input-platform-name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Support Email</label>
                      <Input defaultValue="support@slizacademy.co.zw" data-testid="input-support-email" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Max Course Duration (weeks)</label>
                      <Input type="number" defaultValue="52" data-testid="input-max-duration" />
                    </div>
                    <Button className="w-full" data-testid="button-save-settings">
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Require Email Verification</p>
                        <p className="text-sm text-muted-foreground">New users must verify their email</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="checkbox-email-verification" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Course Approval Required</p>
                        <p className="text-sm text-muted-foreground">Admin approval needed for new courses</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="checkbox-course-approval" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Public Registration</p>
                        <p className="text-sm text-muted-foreground">Allow public user registration</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4" data-testid="checkbox-public-registration" />
                    </div>
                    <Button variant="outline" className="w-full" data-testid="button-reset-security">
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
