import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Users, Star } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  difficulty: string;
  duration: string;
  students: number;
  rating: number;
  progress: number;
  onEnroll: () => void;
}

export function CourseCard({
  id,
  title,
  description,
  imageUrl,
  difficulty,
  duration,
  students,
  rating,
  progress,
  onEnroll
}: CourseCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'foundation': return 'bg-primary/90';
      case 'intermediate': return 'bg-accent/90';
      case 'advanced': return 'bg-primary/90';
      case 'professional': return 'bg-accent/90';
      default: return 'bg-primary/90';
    }
  };

  const getGradientColors = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'foundation': return 'from-primary to-accent';
      case 'intermediate': return 'from-accent to-primary';
      case 'advanced': return 'from-primary to-accent';
      case 'professional': return 'from-accent to-primary';
      default: return 'from-primary to-accent';
    }
  };

  return (
    <Card className="glass-card rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 course-card group">
      <div className="relative h-48">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={title}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 right-4">
          <span className={`${getDifficultyColor(difficulty)} backdrop-blur text-background px-3 py-1 rounded-full text-sm font-medium`}>
            {difficulty}
          </span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="font-display font-semibold text-xl mb-2" data-testid={`course-title-${id}`}>
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4" data-testid={`course-description-${id}`}>
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center" data-testid={`course-duration-${id}`}>
            <Clock className="w-4 h-4 mr-1" />
            {duration}
          </span>
          <span className="flex items-center" data-testid={`course-students-${id}`}>
            <Users className="w-4 h-4 mr-1" />
            {students} students
          </span>
          <span className="flex items-center" data-testid={`course-rating-${id}`}>
            <Star className="w-4 h-4 mr-1 text-accent fill-accent" />
            {rating}
          </span>
        </div>
        
        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span data-testid={`course-progress-${id}`}>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getGradientColors(difficulty)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <Button 
          className={`w-full py-3 bg-gradient-to-r ${getGradientColors(difficulty)} text-background font-semibold rounded-lg hover:shadow-lg transition-all group-hover:scale-105`}
          onClick={onEnroll}
          data-testid={`button-enroll-${id}`}
        >
          {progress > 0 ? 'Continue' : 'Enroll Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
