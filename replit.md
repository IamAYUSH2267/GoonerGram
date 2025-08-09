# Overview

Gooners is a social media platform built as a full-stack web application with real-time features. It's designed as a community-focused platform where users can share posts (text, images, videos), create 24-hour stories, engage in private and group chats, and participate in a global chat room. The application uses modern web technologies with a React frontend and Express.js backend, featuring a dark purple/neon theme aesthetic.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot module replacement with Vite integration in development mode

## Authentication System
- **Provider**: Replit's OpenID Connect (OIDC) authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Strategy**: Passport.js with OpenID Connect strategy
- **Authorization**: Session-based authentication with middleware protection

## Database Schema
- **Users**: Profile management with username, bio, profile images
- **Posts**: Support for text, image, and video content with engagement metrics
- **Stories**: 24-hour expiring content with media support  
- **Chat System**: Private chat rooms, group chats, and global messaging
- **Social Features**: Post likes, comments, and gooning partner relationships
- **Sessions**: Secure session storage for authentication persistence

## API Design
- **Pattern**: RESTful endpoints with consistent error handling
- **Structure**: Route handlers separated into dedicated modules
- **Middleware**: Authentication middleware, request logging, and error handling
- **File Organization**: Shared schema between client and server for type safety

## Real-time Features
- **Implementation**: Polling-based updates for messages and posts (3-second intervals)
- **Chat System**: Real-time messaging in both private and global chat rooms
- **Live Updates**: Automatic refresh of posts, stories, and chat messages

## Development Workflow
- **Monorepo Structure**: Shared types and schemas between frontend and backend
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Full TypeScript coverage with shared schema validation using Zod
- **Database Management**: Drizzle migrations with push commands for schema updates

# External Dependencies

## Authentication Service
- **Replit OIDC**: Primary authentication provider using OpenID Connect
- **Environment Variables**: REPL_ID, ISSUER_URL, SESSION_SECRET for auth configuration

## Database
- **Neon Database**: PostgreSQL-compatible serverless database
- **Connection**: @neondatabase/serverless with WebSocket support for serverless environments
- **Environment Variable**: DATABASE_URL for connection string

## UI Framework
- **Radix UI**: Headless component primitives for accessibility and functionality
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom design system

## Development Tools
- **Vite**: Frontend build tool and development server with HMR
- **Replit Integration**: Development environment integration with cartographer plugin
- **TypeScript**: Full type safety across the entire application stack