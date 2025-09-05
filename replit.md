# Sports Leaders Institute of Zimbabwe - Modern LMS Platform

## Overview

This is a comprehensive Learning Management System (LMS) designed for the Sports Leaders Institute of Zimbabwe. The platform provides a cutting-edge educational experience for sports leadership training with a futuristic, sports-themed design. The system supports multiple user roles (students, instructors, and administrators) and features modern UI components, course management, user authentication, and progress tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with proper HTTP status codes and JSON responses
- **Middleware**: Custom logging, JSON parsing, and error handling middleware
- **Development**: Hot module replacement and development server integration

### Database Layer
- **Database**: PostgreSQL for robust relational data storage
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Connection**: Neon serverless PostgreSQL connection with connection pooling
- **Migrations**: Schema versioning through Drizzle Kit migration system

### Authentication System
- **Provider**: Replit Authentication using OpenID Connect (OIDC)
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Authorization**: Role-based access control (student, instructor, admin)
- **Security**: HTTP-only cookies, secure session handling, and CSRF protection

### UI/UX Design System
- **Theme**: Dark mode primary with futuristic sports aesthetic
- **Colors**: Electric blue and lime green neon accents with neutral base colors
- **Typography**: Inter for body text, Poppins for display headings
- **Effects**: Glassmorphism cards, smooth animations, and 3D hover effects
- **Responsive**: Mobile-first design with adaptive layouts for all screen sizes

### Data Schema Design
- **Users**: Comprehensive user profiles with role-based permissions
- **Courses**: Structured learning content with categories and difficulty levels
- **Modules & Lessons**: Hierarchical content organization with progress tracking
- **Assessments**: Quiz and evaluation system with attempt tracking
- **Achievements**: Gamification through badges and certificates
- **Forums**: Community features for discussions and collaboration
- **Analytics**: Progress tracking and performance metrics

## External Dependencies

### Core Development Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database schema management and migrations
- **express**: Web application framework for Node.js
- **connect-pg-simple**: PostgreSQL session store for Express

### Authentication & Security
- **openid-client**: OpenID Connect client for Replit authentication
- **passport**: Authentication middleware for Node.js
- **express-session**: Session management middleware
- **memoizee**: Function memoization for performance optimization

### Frontend UI Libraries
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight client-side routing library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-aware component APIs

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development plugins

### Form & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation library resolvers
- **zod**: Schema validation and type inference
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Utility Libraries
- **clsx**: Utility for constructing className strings conditionally
- **date-fns**: Modern JavaScript date utility library
- **lucide-react**: Feature-rich icon library
- **cmdk**: Command palette component