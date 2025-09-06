import { Navigation } from '@/components/navigation';
import { BadgeDisplay } from '@/components/badge-display';

export default function Badges() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">
            Your <span className="text-gradient">Achievements</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your progress and showcase your earned badges and certificates
          </p>
        </div>

        <BadgeDisplay />
      </div>
    </div>
  );
}
