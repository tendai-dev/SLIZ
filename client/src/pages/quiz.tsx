import { useParams } from 'wouter';
import { Navigation } from '@/components/navigation';
import { QuizInterface } from '@/components/quiz-interface';
import { useQuery } from '@tanstack/react-query';

export default function Quiz() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ['/api/courses', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return response.json();
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-20 mt-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-20 mt-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Quiz Assessment
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge and earn your digital badge
          </p>
        </div>

        <QuizInterface 
          courseId={courseId!}
          courseTitle={course.title}
          onComplete={(score, passed) => {
            console.log(`Quiz completed: ${score}% - ${passed ? 'Passed' : 'Failed'}`);
          }}
        />
      </div>
    </div>
  );
}
