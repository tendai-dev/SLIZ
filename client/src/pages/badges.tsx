import { Navigation } from '@/components/navigation';
import { useEffect, useState } from 'react';
import { BadgeDisplay } from '@/components/badge-display';
import { useUser } from '@clerk/clerk-react';

interface Badge {
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
  score?: number;
}

export function BadgesPage() {
  const { user } = useUser();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [user]);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const data = await response.json();
        
        // Transform badges to include WVU/SLIZ partnership info
        const transformedBadges = (data || []).map((badge: any) => ({
          ...badge,
          issuingOrg: 'BOTH', // Both SLIZ and WVU issue badges
          score: badge.score || 80, // Include score if available
        }));
        
        setBadges(transformedBadges);
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Digital Badges & Certificates
            </h1>
            <p className="text-lg text-muted-foreground">
              Earn recognition from Sports Leaders Institute of Zimbabwe and West Virginia University
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <BadgeDisplay />
          )}
        </div>
      </div>
    </div>
  );
}
