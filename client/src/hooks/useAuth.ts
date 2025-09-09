import { useUser } from '@clerk/clerk-react';

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();

  // For development, provide a test user if not signed in
  const devUser = {
    id: 'test-user-dev',
    email: 'test@sliz.edu.zw',
    firstName: 'Test',
    lastName: 'User',
    role: 'student'
  };

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.publicMetadata?.role as string || 'student'
    } : null,
    isAuthenticated: isSignedIn || false,
    isLoading: !isLoaded,
  };
}
