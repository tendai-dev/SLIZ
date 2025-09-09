import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { CourseCard } from '@/components/course-card';
import { ScormLauncher } from '@/components/scorm-player';
import { LoadingSpinner, CourseCardSkeleton } from '@/components/loading-spinner';
import { Trophy, Medal, Star, Users, Clock, Play, Video, Rocket, Calendar, CheckCircle, Shield, Zap, BookOpen, Award, Target, BarChart3, Globe } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch actual SCORM courses from the API
  const { data: scormCourses = [], isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/30 rotate-45 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-accent/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-12 h-12 border-2 border-accent/40 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto px-6 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center space-x-2 glass-card border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Medal className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Zimbabwe's Premier Sports Leadership Platform</span>
              </div>
              
              <h1 className="font-display font-bold text-6xl md:text-7xl lg:text-8xl mb-6 leading-tight">
                <span className="text-gradient">Master Sports</span>
                <br />
                <span className="text-black">Leadership</span>
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-black font-medium">
                Executive Sport Management Training – Level 1
              </p>
              <p className="text-lg md:text-xl text-black mb-8 max-w-2xl">
                Transform your career with industry-leading sports management education.
                Join Zimbabwe's premier sports leadership institute.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" signInFallbackRedirectUrl="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
                    data-testid="button-start-learning"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning Today
                  </Button>
                </SignUpButton>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass-card neon-border text-foreground font-semibold hover:shadow-lg transition-all"
                  data-testid="button-watch-demo"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary stat-glow mb-1" data-testid="stat-students">500+</div>
                  <div className="text-sm text-muted-foreground">Students Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent stat-glow mb-1" data-testid="stat-instructors">50+</div>
                  <div className="text-sm text-muted-foreground">Expert Instructors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary stat-glow mb-1" data-testid="stat-completion">95%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </div>

            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Sports Hero Image */}
              <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                  alt="Sports Leadership Training" 
                  className="w-full h-80 object-cover"
                  data-testid="img-sports-hero"
                />
              </div>
              
              {/* Hero Dashboard Preview */}
              <Card className="glass-card rounded-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Student Dashboard</h3>
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeDasharray="75, 100" 
                          className="text-primary"
                        />
                        <path 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeDasharray="0, 100" 
                          className="text-border"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">75%</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">Leadership Fundamentals</p>
                      <p className="text-sm text-muted-foreground">3 of 4 modules complete</p>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Recent Achievements</h4>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                        <Medal className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center opacity-50">
                        <Star className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Course Cards */}
              <Card className="absolute -top-4 -right-4 glass-card rounded-xl p-4 w-48 animate-float" style={{animationDelay: '1s'}}>
                <CardContent className="p-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Team Management</p>
                      <p className="text-xs text-muted-foreground">12 lessons available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-black">What You Will</span>
              <span className="text-gradient"> Benefit From The Courses</span>
            </h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Advanced learning technology meets world-class sports education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 items-stretch">
            {[
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Master Strategic Leadership",
                description: "Develop advanced leadership skills to confidently guide sports organizations, teams, and programs with strategic vision and effective decision-making",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Build Professional Credibility",
                description: "Gain industry-recognized expertise that establishes you as a trusted authority in sports management and opens doors to executive opportunities",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Accelerate Career Growth",
                description: "Fast-track your professional advancement with skills that make you indispensable and ready for senior management roles in sports organizations",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: "Earn Executive Certification",
                description: "Receive prestigious Level 1 Executive Sport Management certification that validates your expertise and enhances your professional profile",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Achieve Measurable Results",
                description: "Apply proven methodologies to deliver tangible improvements in team performance, organizational efficiency, and program success rates",
                color: "from-red-500 to-rose-500"
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Make Data-Driven Decisions",
                description: "Master analytics and performance metrics to make informed decisions that drive success and demonstrate your impact with concrete evidence",
                color: "from-indigo-500 to-blue-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group h-full">
                <Card className="glass-card rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors text-black">{feature.title}</h3>
                    <p className="text-black flex-1">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 text-center">
              <span className="text-black">Featured</span>
              <span className="text-gradient"> Executive Courses</span>
            </h2>
            <p className="text-xl text-black text-center mb-8 max-w-3xl mx-auto">
              Four comprehensive Level 1 courses designed by industry experts.
              Pass 3 out of 4 to earn your executive certificate.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">SCORM 1.2 & 2004 Compatible</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Cross-Platform Access</span>
              </div>
            </div>
          </div>

          {coursesLoading ? (
            <CourseCardSkeleton count={4} />
          ) : coursesError ? (
            <div className="col-span-full text-center py-12">
              <div className="text-black mb-4">Unable to load courses. Please try again later.</div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="hover-lift"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
              {scormCourses.length > 0 ? (
                scormCourses.slice(0, 4).map((course: any) => (
                  <div key={course.id} className="w-full h-full">
                    <ScormLauncher
                      courseId={course.id}
                      courseTitle={course.title}
                      description={course.description}
                      imageUrl={course.imageUrl || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                    />
                  </div>
                ))
              ) : (
                // Fallback SCORM courses if API returns empty
                [
                  {
                    id: "s-l-i-z-micro-course-1-sport-facility-and-event-management-scorm12-QOrGCF5z",
                    title: "Sport Facility and Event Management",
                    description: "Master the fundamentals of managing sports facilities and organizing successful events. Learn best practices for facility operations, event planning, and resource management.",
                    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  },
                  {
                    id: "s-l-i-z-micro-course-2-basic-finance-management-scorm12-D24iHB-D", 
                    title: "Basic Finance Management",
                    description: "Learn essential financial management skills for sports organizations. Cover budgeting, financial planning, and revenue optimization strategies.",
                    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  },
                  {
                    id: "s-l-i-z-micro-course-3-sport-marketing-scorm12-LpQGKIfD",
                    title: "Sport Marketing",
                    description: "Develop effective marketing strategies for sports brands and events. Master digital marketing, sponsorship management, and fan engagement techniques.",
                    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  },
                  {
                    id: "s-l-i-z-micro-course-4-management-of-sport-organizations-scorm12-wrUhSRL8",
                    title: "Management of Sport Organizations", 
                    description: "Lead and manage sports organizations with confidence and expertise. Learn organizational leadership, strategic planning, and governance principles.",
                    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  }
                ].map((course) => (
                  <div key={course.id} className="w-full h-full">
                    <ScormLauncher
                      courseId={course.id}
                      courseTitle={course.title}
                      description={course.description}
                      imageUrl={course.imageUrl}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-black">What Our</span>
              <span className="text-gradient"> Students Say</span>
            </h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Real experiences from sports professionals who've transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Tendai Mukamuri",
                role: "Sports Director, Dynamos FC",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                content: "The leadership fundamentals course completely changed how I approach team management. The practical insights are invaluable for any sports professional."
              },
              {
                name: "Grace Nhongo",
                role: "Athletic Programs Manager",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                content: "SLIZ Academy's program development course gave me the tools to create sustainable athletic programs that truly impact our community."
              },
              {
                name: "Brian Chivanga",
                role: "Youth Development Coach",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                content: "The interactive learning experience and expert instructors made complex leadership concepts easy to understand and apply in real-world situations."
              }
            ].map((testimonial, index) => (
              <Card key={index} className="glass-card rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/20 transition-all">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div>
                      <h4 className="font-semibold text-black">{testimonial.name}</h4>
                      <p className="text-sm text-black">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-black mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-black">Ready to</span>
              <span className="text-gradient"> Lead Sports?</span>
            </h2>
            <p className="text-xl text-black max-w-2xl mx-auto mb-8">
              Join thousands of sports professionals who've advanced their careers with SLIZ Academy.
              Start your executive training today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard" signInFallbackRedirectUrl="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Get Started Now
                </Button>
              </SignUpButton>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-primary text-primary hover:bg-primary hover:text-background transition-all"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-xl text-primary">SLIZ Academy</span>
              </div>
              <p className="text-black mb-8">
                Sports Leadership Institute of Zimbabwe
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-black">Courses</h4>
              <ul className="space-y-2 text-black">
                <li><a href="#" className="hover:text-primary transition-colors">Sport Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Leadership Training</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Event Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Finance Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-black">Support</h4>
              <ul className="space-y-2 text-black">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4 text-black">Connect</h4>
              <ul className="space-y-2 text-black">
                <li>info@slizacademy.co.zw</li>
                <li>+263 4 123 456</li>
                <li>Harare, Zimbabwe</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-black mb-8">
              Sports Leadership Institute of Zimbabwe
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-black hover:text-primary text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-black hover:text-primary text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-black hover:text-primary text-sm transition-colors">Cookie Policy</a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-black">
                © 2024 Sports Leadership Institute of Zimbabwe. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
