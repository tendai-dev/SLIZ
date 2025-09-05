import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Trophy, Menu, User } from 'lucide-react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationProps {
  isAuthenticated?: boolean;
  user?: any;
  onSignIn?: () => void;
  onGetStarted?: () => void;
  onSignOut?: () => void;
}

export function Navigation({ 
  isAuthenticated = false, 
  user, 
  onSignIn, 
  onGetStarted, 
  onSignOut 
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href={isAuthenticated ? "/" : "/"}>
            <div className="flex items-center space-x-4 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-gradient">
                  SLIZ Academy
                </h1>
                <p className="text-xs text-muted-foreground">Sports Leadership Institute</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/courses">
                  <a className="text-foreground hover:text-primary transition-colors" data-testid="nav-courses">
                    Courses
                  </a>
                </Link>
                <Link href="/dashboard/student">
                  <a className="text-foreground hover:text-primary transition-colors" data-testid="nav-dashboard">
                    Dashboard
                  </a>
                </Link>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.firstName?.[0] || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/student">
                        <a className="w-full" data-testid="menu-dashboard">Dashboard</a>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'instructor' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/instructor">
                          <a className="w-full" data-testid="menu-instructor-dashboard">Instructor Panel</a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin">
                          <a className="w-full" data-testid="menu-admin-dashboard">Admin Panel</a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut} data-testid="menu-sign-out">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <a href="#" className="text-foreground hover:text-primary transition-colors">Courses</a>
                <a href="#" className="text-foreground hover:text-primary transition-colors">About</a>
                <a href="#" className="text-foreground hover:text-primary transition-colors">Contact</a>
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={onSignIn}
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-gradient-to-r from-primary to-accent text-background font-semibold hover:shadow-lg hover:shadow-primary/25"
                  onClick={onGetStarted}
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-card border-border/50">
              <div className="flex flex-col space-y-4 mt-8">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 pb-4 border-b border-border/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.firstName?.[0] || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                    
                    <Link href="/courses">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-left"
                        onClick={() => setIsOpen(false)}
                        data-testid="mobile-nav-courses"
                      >
                        Courses
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard/student">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-left"
                        onClick={() => setIsOpen(false)}
                        data-testid="mobile-nav-dashboard"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    
                    {user?.role === 'instructor' && (
                      <Link href="/dashboard/instructor">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left"
                          onClick={() => setIsOpen(false)}
                          data-testid="mobile-nav-instructor"
                        >
                          Instructor Panel
                        </Button>
                      </Link>
                    )}
                    
                    {user?.role === 'admin' && (
                      <Link href="/dashboard/admin">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-left"
                          onClick={() => setIsOpen(false)}
                          data-testid="mobile-nav-admin"
                        >
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => {
                        onSignOut?.();
                        setIsOpen(false);
                      }}
                      data-testid="mobile-button-sign-out"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      Courses
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      About
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => {
                        onSignIn?.();
                        setIsOpen(false);
                      }}
                      data-testid="mobile-button-sign-in"
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent text-background"
                      onClick={() => {
                        onGetStarted?.();
                        setIsOpen(false);
                      }}
                      data-testid="mobile-button-get-started"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
