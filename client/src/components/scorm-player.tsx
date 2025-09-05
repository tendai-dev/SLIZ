import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, X, Maximize2, Minimize2 } from 'lucide-react';
import { useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';

interface ScormPlayerProps {
  courseId: string;
  courseTitle: string;
  launchUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ScormPlayer({ courseId, courseTitle, launchUrl, isOpen, onClose }: ScormPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (isOpen && user) {
      // Log SCORM launch event
      fetch('/api/scorm/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          launchUrl,
        }),
      }).catch(console.error);
    }
  }, [isOpen, courseId, launchUrl, user]);

  const handleClose = () => {
    if (user) {
      // Log SCORM close event
      fetch('/api/scorm/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
        }),
      }).catch(console.error);
    }
    onClose();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-full h-full w-full' : 'max-w-6xl h-[80vh]'} p-0`}
      >
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{courseTitle}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading SCORM content...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={launchUrl}
            className="w-full h-full border-0"
            title={courseTitle}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ScormLauncherProps {
  courseId: string;
  courseTitle: string;
  description: string;
  imageUrl?: string;
  onEnroll?: () => void;
}

export function ScormLauncher({ courseId, courseTitle, description, imageUrl, onEnroll }: ScormLauncherProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [launchUrl, setLaunchUrl] = useState('');
  const { isSignedIn } = useUser();

  const handleLaunch = async () => {
    if (!isSignedIn) {
      return; // Let the SignUpButton handle authentication
    }

    try {
      // First enroll the user in the course
      const enrollResponse = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (enrollResponse.ok) {
        // Then launch the SCORM course
        const scormUrl = `/scorm-courses/${courseId}/scormcontent/index.html`;
        setLaunchUrl(scormUrl);
        setIsPlayerOpen(true);
      } else {
        console.error('Failed to enroll in course');
      }
    } catch (error) {
      console.error('Failed to launch SCORM course:', error);
    }
  };

  return (
    <>
      <Card className="glass-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 overflow-hidden">
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <img 
              src={imageUrl} 
              alt={courseTitle}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                SCORM Course
              </span>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gradient">{courseTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-3">{description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full">SCORM</span>
              <span>Self-paced</span>
              <span>Interactive</span>
            </div>
          </div>
          
          {isSignedIn ? (
            <Button 
              onClick={handleLaunch}
              className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Course
            </Button>
          ) : (
            <div className="space-y-2">
              <SignUpButton mode="modal" fallbackRedirectUrl="/" signInFallbackRedirectUrl="/">
                <Button className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all">
                  <Play className="w-4 h-4 mr-2" />
                  Sign Up to Access
                </Button>
              </SignUpButton>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <SignInButton mode="modal" fallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
                  <button className="text-primary hover:underline font-medium">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ScormPlayer
        courseId={courseId}
        courseTitle={courseTitle}
        launchUrl={launchUrl}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />
    </>
  );
}
