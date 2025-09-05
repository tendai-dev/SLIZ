import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { CourseCard } from '@/components/course-card';
import { Trophy, Medal, Star, Users, Clock, Play, Video, Rocket, Calendar } from 'lucide-react';

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation onSignIn={handleSignIn} onGetStarted={handleGetStarted} />
      
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
              
              <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
                <span className="text-gradient">Master</span><br/>
                <span className="text-foreground">Sports</span><br/>
                <span className="text-gradient">Leadership</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Transform your career with cutting-edge sports management courses designed by industry experts. Join Zimbabwe's elite sports leaders.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
                  onClick={handleGetStarted}
                  data-testid="button-start-learning"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning Today
                </Button>
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

      {/* Featured Courses */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-gradient">Transform Your Career</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master the essential skills needed to lead in today's competitive sports industry
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <CourseCard
              id="1"
              title="Sports Leadership Fundamentals"
              description="Master the core principles of effective sports leadership and team management"
              imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              difficulty="Foundation"
              duration="8 weeks"
              students={156}
              rating={4.9}
              progress={0}
              onEnroll={() => handleGetStarted()}
            />
            <CourseCard
              id="2"
              title="Team Management & Communication"
              description="Develop advanced communication skills and team dynamics management"
              imageUrl="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              difficulty="Intermediate"
              duration="6 weeks"
              students={89}
              rating={4.8}
              progress={0}
              onEnroll={() => handleGetStarted()}
            />
            <CourseCard
              id="3"
              title="Athletic Program Development"
              description="Design and implement comprehensive athletic programs from conception to execution"
              imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              difficulty="Advanced"
              duration="10 weeks"
              students={67}
              rating={4.9}
              progress={0}
              onEnroll={() => handleGetStarted()}
            />
            <CourseCard
              id="4"
              title="Sports Administration & Governance"
              description="Navigate complex sports governance, compliance, and administrative excellence"
              imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
              difficulty="Professional"
              duration="12 weeks"
              students={43}
              rating={4.7}
              progress={0}
              onEnroll={() => handleGetStarted()}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
              <span className="text-foreground">What Sports Leaders</span>
              <span className="text-gradient"> Are Saying</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of professionals who have transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Tendai Mukamuri",
                role: "Sports Director, Dynamos FC",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                testimonial: "The leadership fundamentals course completely changed how I approach team management. The practical insights are invaluable for any sports professional."
              },
              {
                name: "Grace Nhongo",
                role: "Athletic Programs Manager",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                testimonial: "SLIZ Academy's program development course gave me the tools to create sustainable athletic programs that truly impact our community."
              },
              {
                name: "Brian Chivanga",
                role: "Youth Development Coach",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
                testimonial: "The interactive learning experience and expert instructors made complex leadership concepts easy to understand and apply in real-world situations."
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
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{testimonial.testimonial}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display font-bold text-4xl md:text-6xl mb-6">
              <span className="text-foreground">Ready to Lead the</span><br/>
              <span className="text-gradient">Future of Sports?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join Zimbabwe's premier sports leadership platform and unlock your potential with cutting-edge courses designed by industry experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105 text-lg px-8 py-4"
                onClick={handleGetStarted}
                data-testid="button-start-journey"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Your Journey Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="glass-card neon-border text-foreground font-semibold hover:shadow-lg transition-all text-lg px-8 py-4"
                data-testid="button-schedule-demo"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule a Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary stat-glow mb-2" data-testid="stat-active-students">500+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent stat-glow mb-2" data-testid="stat-completion-rate">95%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary stat-glow mb-2" data-testid="stat-average-rating">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent stat-glow mb-2" data-testid="stat-expert-instructors">50+</div>
                <div className="text-sm text-muted-foreground">Expert Instructors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-gradient">
                    SLIZ Academy
                  </h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">Empowering Zimbabwe's next generation of sports leaders through innovative education and technology.</p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Courses</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Leadership Fundamentals</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Team Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Program Development</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Sports Administration</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Student Resources</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Technical Support</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>info@slizacademy.co.zw</li>
                <li>+263 4 123 456</li>
                <li>Harare, Zimbabwe</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">&copy; 2024 Sports Leaders Institute of Zimbabwe. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
