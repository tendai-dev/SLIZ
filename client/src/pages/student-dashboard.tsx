import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/navigation';
import { ProgressChart } from '@/components/progress-chart';
import { AchievementBadge } from '@/components/achievement-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  Award, 
  Calendar,
  Target,
  TrendingUp,
  Star,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data: stats = {}, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/dashboard/student'],
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<any[]>({
    queryKey: ['/api/enrollments/my'],
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<any[]>({
    queryKey: ['/api/achievements/my'],
  });

  const handleSignOut = () => {
    window.location.href = '/api/logout';
  };

  if (statsLoading || enrollmentsLoading || achievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock data for demonstration - in production this would come from API
  const weeklyData = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 1.8 },
    { day: 'Wed', hours: 3.2 },
    { day: 'Thu', hours: 2.1 },
    { day: 'Fri', hours: 1.2 },
    { day: 'Sat', hours: 0.8 },
    { day: 'Sun', hours: 2.9 },
  ];

  const weeklyGoal = 17;
  const currentWeekHours = 14.5;
  const goalProgress = Math.round((currentWeekHours / weeklyGoal) * 100);

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
            Welcome back, {(user as any)?.firstName}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and continue your sports leadership journey
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
              <p className="text-xs text-muted-foreground">Active learning paths</p>
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
              <p className="text-xs text-muted-foreground">Certificates earned</p>
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
              <p className="text-xs text-muted-foreground">Total learning time</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent" data-testid="stat-achievements">
                {achievements.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Badges unlocked</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Learning Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress Chart */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-display">Learning Progress</CardTitle>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  This Week
                </Button>
              </CardHeader>
              <CardContent>
                <ProgressChart data={weeklyData} />
              </CardContent>
            </Card>

            {/* Continue Learning */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display">Continue Learning</CardTitle>
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
                            Sports Leadership Course
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            Module 3: Strategic Planning
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Progress 
                              value={Math.round(parseFloat(enrollment.progress) || 0)} 
                              className="w-32" 
                            />
                            <span className="text-xs text-primary font-semibold">
                              {Math.round(parseFloat(enrollment.progress) || 0)}%
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20">
                          <PlayCircle className="w-4 h-4 mr-2" />
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
                      <Button data-testid="button-browse-courses">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goal */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Weekly Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeDasharray={`${goalProgress}, 100`}
                      className="text-primary"
                    />
                    <path 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeDasharray="0, 100" 
                      className="text-border"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary" data-testid="weekly-goal-progress">
                      {goalProgress}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground" data-testid="weekly-goal-status">
                  {currentWeekHours} of {weeklyGoal} hours completed
                </p>
                <p className="text-xs text-primary font-semibold mt-1">
                  Keep up the great work!
                </p>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AchievementBadge
                    name="Leadership Pioneer"
                    description="First course completed"
                    icon="medal"
                    earned={true}
                  />
                  <AchievementBadge
                    name="Consistent Learner"
                    description="7-day learning streak"
                    icon="star"
                    earned={true}
                  />
                  <AchievementBadge
                    name="Course Master"
                    description="Complete 3 courses"
                    icon="trophy"
                    earned={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Upcoming Deadlines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Module 3 Quiz</p>
                      <p className="text-xs text-muted-foreground">Leadership Fundamentals</p>
                    </div>
                    <Badge className="text-xs bg-primary/20 text-primary">
                      2 days
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Assignment Submit</p>
                      <p className="text-xs text-muted-foreground">Team Management</p>
                    </div>
                    <Badge className="text-xs bg-accent/20 text-accent">
                      5 days
                    </Badge>
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
                <Link href="/courses">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-explore-courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-certificates">
                  <Award className="w-4 h-4 mr-2" />
                  My Certificates
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-discussion-forums">
                  <Trophy className="w-4 h-4 mr-2" />
                  Discussion Forums
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
