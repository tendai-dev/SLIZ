import { requireAuth as clerkRequireAuth, ClerkRequest } from '@clerk/express';
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export async function setupClerkAuth(app: Express) {
  // Clerk webhook for user creation/updates
  app.post('/api/webhooks/clerk', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (type === 'user.created' || type === 'user.updated') {
        const user = data;
        await storage.upsertUser({
          id: user.id,
          email: user.email_addresses?.[0]?.email_address || '',
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          profileImageUrl: user.profile_image_url || '',
          role: 'student' // Default role for new users
        });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Clerk webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: ClerkRequest, res) => {
    try {
      const { userId } = req.auth;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

// Middleware to require authentication
export const requireAuth: RequestHandler = clerkRequireAuth();

// Middleware for optional authentication (for now, same as required)
export const withAuth: RequestHandler = clerkRequireAuth();

// Helper to get current user from request
export async function getCurrentUser(req: ClerkRequest) {
  const { userId } = req.auth;
  if (!userId) return null;
  
  try {
    return await storage.getUser(userId);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
