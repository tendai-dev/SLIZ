import { Trophy, Medal, Star, Award, Target, Zap } from 'lucide-react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

const iconMap = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  award: Award,
  target: Target,
  zap: Zap,
};

export function AchievementBadge({ name, description, icon, earned, earnedDate }: AchievementBadgeProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Trophy;
  
  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
        earned 
          ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20' 
          : 'bg-muted/10 opacity-50'
      }`}
      data-testid={`achievement-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        earned 
          ? 'bg-gradient-to-br from-primary to-accent' 
          : 'bg-muted'
      }`}>
        <IconComponent className={`w-6 h-6 ${earned ? 'text-white' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-sm ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {earned && earnedDate && (
          <p className="text-xs text-primary font-medium mt-1">
            Earned {new Date(earnedDate).toLocaleDateString()}
          </p>
        )}
      </div>
      {earned && (
        <div className="text-primary">
          <Trophy className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
