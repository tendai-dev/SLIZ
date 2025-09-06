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
  const [progress, setProgress] = useState(0);
  const [scormData, setScormData] = useState<any>({});
  const { user } = useUser();

  // Load saved progress when opening course
  useEffect(() => {
    if (isOpen && user) {
      // Fetch existing progress
      fetch(`/api/enrollments/my`)
        .then(res => res.json())
        .then(enrollments => {
          const enrollment = enrollments.find((e: any) => e.courseId === courseId);
          if (enrollment) {
            setProgress(enrollment.progress || 0);
            // Load saved SCORM data if available
            if (enrollment.scormData) {
              setScormData(enrollment.scormData);
            }
          }
        })
        .catch(console.error);

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
  }, [isOpen, courseId, user]);

  // Set up SCORM API for the iframe
  useEffect(() => {
    if (isOpen) {
      // Create SCORM API object that the course can interact with
      (window as any).API = {
        LMSInitialize: () => {
          console.log('SCORM: LMSInitialize');
          return 'true';
        },
        LMSFinish: () => {
          console.log('SCORM: LMSFinish');
          // Save final progress
          handleSaveProgress();
          return 'true';
        },
        LMSGetValue: (key: string) => {
          console.log('SCORM: LMSGetValue', key);
          return scormData[key] || '';
        },
        LMSSetValue: (key: string, value: string) => {
          console.log('SCORM: LMSSetValue', key, value);
          setScormData((prev: any) => ({ ...prev, [key]: value }));
          
          // Track progress based on SCORM data
          if (key === 'cmi.core.lesson_status' && value === 'completed') {
            setProgress(100);
          } else if (key === 'cmi.core.score.raw') {
            const score = parseInt(value);
            if (!isNaN(score)) {
              setProgress(score);
            }
          }
          return 'true';
        },
        LMSCommit: () => {
          console.log('SCORM: LMSCommit');
          // Save current progress
          handleSaveProgress();
          return 'true';
        },
        LMSGetLastError: () => '0',
        LMSGetErrorString: () => 'No error',
        LMSGetDiagnostic: () => ''
      };

      // Also support SCORM 2004
      (window as any).API_1484_11 = (window as any).API;
    }

    return () => {
      // Clean up SCORM API
      delete (window as any).API;
      delete (window as any).API_1484_11;
    };
  }, [isOpen, scormData, courseId]);

  const handleSaveProgress = () => {
    // Save current progress and SCORM data to server
    fetch('/api/scorm/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId,
        progress,
        scormData,
        completed: progress >= 100,
      }),
    }).catch(console.error);
  };

  const handleClose = () => {
    if (user) {
      // Log SCORM close event and final progress
      fetch('/api/scorm/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
        }),
      }).catch(console.error);

      // Save final progress with SCORM data
      handleSaveProgress();
    }
    onClose();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      
      {/* Modal Content */}
      <div className={`fixed ${isFullscreen ? 'inset-0' : 'inset-8'} bg-background rounded-lg shadow-xl flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h2 className="text-xl font-semibold">{courseTitle}</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-9 w-9"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="px-4 py-2 border-b bg-background/95">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
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
      </div>
    </div>
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
      const enrollResponse = await fetch(`/api/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
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
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" signInFallbackRedirectUrl="/dashboard">
                <Button className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all">
                  <Play className="w-4 h-4 mr-2" />
                  Sign Up to Access
                </Button>
              </SignUpButton>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
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
