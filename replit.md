# Hexagonal Tile Board Game

## Overview

This is a single-player hexagonal tile board game built with React, TypeScript, and Express. The game features a 5x5 hexagonal board where players place colored number tiles following specific placement rules. Players must match either colors or shared digits with neighboring tiles to place new pieces, with the goal of reaching a target score.

The application uses a full-stack architecture with a React frontend, Express backend, PostgreSQL database with Drizzle ORM, and includes comprehensive UI components built with Radix UI and styled with Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in strict mode
- **Build Tool**: Vite with custom configuration for client-side builds
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: Comprehensive Radix UI component library with custom styled variants
- **State Management**: Zustand stores for game state and audio management
- **Game Logic**: Custom hexagonal board system with drag-and-drop tile placement
- **3D Graphics**: React Three Fiber integration with GLSL shader support
- **Data Fetching**: TanStack Query for server state management

### Game Engine
- **Board System**: 5-row hexagonal grid with variable column counts (5-6 spots per row)
- **Tile Logic**: Color-number tiles with placement validation based on neighboring tiles
- **Game Rules**: First tile can be placed anywhere, subsequent tiles require color or digit matching
- **Scoring System**: Target-based progression with round advancement
- **Interaction**: Native HTML5 drag-and-drop API with visual feedback

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle with type-safe schema definitions and migrations
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with structured error handling
- **Development**: Hot reload with Vite middleware integration

### Data Storage
- **Database**: PostgreSQL hosted on Neon serverless platform
- **Schema Management**: Drizzle migrations with TypeScript schema definitions
- **Connection**: Environment-based database URL configuration
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development
- **Session Store**: PostgreSQL-backed session persistence using connect-pg-simple

### Development Environment
- **Monorepo Structure**: Shared types and schemas between client and server
- **Path Aliases**: Configured import paths for clean module resolution
- **Type Safety**: Strict TypeScript with comprehensive type checking
- **Build Pipeline**: Separate client (Vite) and server (esbuild) build processes
- **Asset Handling**: Support for 3D models, shaders, and audio files

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Backend**: Express.js with TypeScript support and middleware
- **Database**: Neon serverless PostgreSQL with Drizzle ORM
- **Build Tools**: Vite for frontend, esbuild for backend bundling

### UI and Styling
- **Design System**: Extensive Radix UI component library (30+ components)
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Typography**: Inter font family via Fontsource
- **Utilities**: clsx and tailwind-merge for conditional styling

### Game-Specific Libraries
- **3D Graphics**: React Three Fiber ecosystem (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- **Audio**: HTML5 Audio API with Zustand state management
- **Animations**: CSS animations with Tailwind and Radix UI transitions
- **Interactions**: Native browser drag-and-drop with custom validation

### Development Tools
- **Type Safety**: Zod for runtime type validation and schema generation
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution and hot reload
- **Error Handling**: Custom error overlay plugin for development debugging