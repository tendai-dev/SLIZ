import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Star, Download, Share2, Calendar } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface UserBadge {
  id: string;
  courseId: string;
  courseTitle: string;
  badgeMetadata: {
    name: string;
    description: string;
    issuer: string;
    issuedDate: string;
    criteriaUrl: string;
    badgeImageUrl: string;
  };
  earnedAt: string;
}

interface Certificate {
  id: string;
  userId: string;
  coursesCompleted: number;
  totalCourses: number;
  completionDate: string;
  certificateUrl: string;
}

export function BadgeDisplay() {
  const { user } = useUser();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserBadges();
      fetchUserCertificate();
    }
  }, [user]);

  const fetchUserBadges = async () => {
    try {
      const response = await fetch('/api/quiz/badges');
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    }
  };

  const fetchUserCertificate = async () => {
    try {
      const response = await fetch('/api/quiz/certificate');
      if (response.ok) {
        const data = await response.json();
        setCertificate(data.certificate);
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBadge = (badge: UserBadge) => {
    // Create a downloadable badge image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    // Create gradient background
    const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200);
    gradient.addColorStop(0, '#0ea5e9');
    gradient.addColorStop(1, '#22c55e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);

    // Add badge text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SLIZ Academy', 200, 100);
    
    ctx.font = '18px Arial';
    ctx.fillText(badge.courseTitle, 200, 140);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Digital Badge', 200, 180);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Issued by: ${badge.badgeMetadata.issuer}`, 200, 220);
    ctx.fillText(`Date: ${new Date(badge.earnedAt).toLocaleDateString()}`, 200, 250);

    // Download the badge
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${badge.courseTitle.replace(/\s+/g, '_')}_Badge.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleShareBadge = (badge: UserBadge) => {
    if (navigator.share) {
      navigator.share({
        title: `I earned a badge in ${badge.courseTitle}!`,
        text: `I just completed ${badge.courseTitle} at SLIZ Academy and earned my digital badge!`,
        url: window.location.origin
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `I just earned a digital badge in ${badge.courseTitle} at SLIZ Academy! 🏆 ${window.location.origin}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Certificate Section */}
      {certificate && (
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display">
              🎓 Certificate of Completion
            </CardTitle>
            <p className="text-muted-foreground">
              Congratulations! You've completed {certificate.coursesCompleted} out of {certificate.totalCourses} courses
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="font-semibold text-lg mb-2">Sports Leadership Certificate</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Issued by Sports Leaders Institute of Zimbabwe
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Completed: {new Date(certificate.completionDate).toLocaleDateString()}</span>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
              onClick={() => window.open(certificate.certificateUrl, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Badges Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Medal className="w-6 h-6 text-primary" />
            <span>Digital Badges ({badges.length})</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Earn badges by achieving 80% or higher on course quizzes
          </p>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No badges earned yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete course quizzes with 80% or higher to earn your first badge!
              </p>
              <Button variant="outline">
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className="relative overflow-hidden hover:shadow-lg transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                  <CardContent className="relative p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{badge.courseTitle}</h3>
                    <Badge className="mb-3 bg-gradient-to-r from-primary to-accent text-white">
                      {badge.badgeMetadata.issuer}
                    </Badge>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {badge.badgeMetadata.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground mb-4">
                      <Calendar className="w-3 h-3" />
                      <span>Earned: {new Date(badge.earnedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadBadge(badge)}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareBadge(badge)}
                        className="flex-1"
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Toward Certificate */}
      {!certificate && badges.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Certificate Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Courses Completed</span>
              <span className="text-sm text-muted-foreground">{badges.length} / 4</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                style={{ width: `${(badges.length / 4) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {badges.length >= 3 
                ? "🎉 You're eligible for your certificate! Complete one more course to unlock it."
                : `Complete ${3 - badges.length} more course${3 - badges.length === 1 ? '' : 's'} to earn your certificate.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
