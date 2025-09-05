import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local development
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple development auth routes
  app.get("/api/login", (req, res) => {
    // For development, create a mock user session
    (req.session as any).user = {
      id: 'dev-user-1',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'admin'
    };
    res.redirect('/');
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  // Create a dev user in the database
  try {
    await storage.upsertUser({
      id: 'dev-user-1',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'admin'
    });
  } catch (error) {
    console.log('Dev user already exists or error creating:', error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // For development, always authenticate with a mock user
  if (process.env.NODE_ENV === 'development') {
    (req as any).user = {
      claims: {
        sub: 'dev-user-1',
        email: 'dev@example.com',
        first_name: 'Dev',
        last_name: 'User',
        role: 'admin'
      }
    };
    return next();
  }

  // In production, you would implement proper authentication
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = {
    claims: {
      sub: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role
    }
  };
  
  next();
};
