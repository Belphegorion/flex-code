# Project Structure

## Directory Organization

```
flex-code/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── config/            # Configuration files (database, cloudinary, stripe)
│   │   ├── controllers/       # Request handlers and business logic
│   │   ├── middleware/        # Express middleware (auth, validation, error handling)
│   │   ├── models/            # Mongoose schemas and models
│   │   ├── routes/            # API route definitions
│   │   ├── utils/             # Utility functions (matching algorithm, queues)
│   │   └── server.js          # Application entry point
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   └── Dockerfile             # Backend container configuration
│
├── frontend/                   # React/Vite SPA
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── context/           # React Context providers (Auth, Theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API client and service layer
│   │   ├── App.jsx            # Root application component
│   │   ├── main.jsx           # Application entry point
│   │   └── index.css          # Global styles and Tailwind config
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite build configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── Dockerfile             # Frontend container configuration
│
├── docker-compose.yml          # Multi-container orchestration
└── .amazonq/rules/memory-bank/ # Project documentation
```

## Core Components

### Backend Architecture

#### Models (Data Layer)
- **User.js**: User accounts with role-based access (organizer, professional, admin)
- **Profile.js**: Professional profiles with skills, location, availability, and ratings
- **Job.js**: Job postings with requirements, status, and hired professionals
- **Application.js**: Job applications linking professionals to jobs
- **Review.js**: Rating and review system for completed jobs
- **EscrowTransaction.js**: Payment tracking and escrow management
- **Chat.js & Message.js**: Real-time messaging system

#### Controllers (Business Logic)
- **authController.js**: Authentication, registration, login, token refresh
- **jobController.js**: Job CRUD operations, discovery with ML matching
- **applicationController.js**: Application management, check-in/check-out
- **profileController.js**: Profile management, talent search
- **escrowController.js**: Payment processing, escrow lifecycle
- **chatController.js**: Chat creation, messaging, read status
- **reviewController.js**: Review creation and retrieval
- **adminController.js**: Administrative functions, reliability updates

#### Routes (API Endpoints)
- `/api/auth/*`: Authentication endpoints
- `/api/jobs/*`: Job management and discovery
- `/api/applications/*`: Application workflow
- `/api/profiles/*`: Profile and talent search
- `/api/escrow/*`: Payment and escrow operations
- `/api/chat/*`: Messaging system
- `/api/reviews/*`: Review system
- `/api/admin/*`: Administrative functions

#### Middleware
- **auth.js**: JWT verification and role-based authorization
- **errorHandler.js**: Centralized error handling
- **validation.js**: Request validation using express-validator

#### Utilities
- **matchingAlgorithm.js**: ML-powered job-talent matching with weighted scoring
- **queues.js**: Bull queue setup for background jobs (reliability updates, reminders)
- **scheduler.js**: Cron jobs for scheduled tasks

#### Configuration
- **db.js**: MongoDB connection setup
- **cloudinary.js**: File upload configuration
- **stripe.js**: Payment processing setup

### Frontend Architecture

#### Pages (Route Components)
- Landing, login, registration pages
- Dashboard views for organizers and professionals
- Job listing, detail, and creation pages
- Profile management and search pages
- Chat and messaging interface
- Application tracking pages

#### Components (Reusable UI)
- Navigation and layout components
- Form inputs and validation
- Cards, modals, and overlays
- Job and profile display components
- Chat message components
- Loading and error states

#### Context Providers
- **AuthContext**: User authentication state and methods
- **ThemeContext**: Dark/light mode management

#### Services
- **api.js**: Axios-based API client with interceptors
- Service modules for each API domain (jobs, profiles, etc.)

#### Hooks
- Custom hooks for data fetching
- Form handling hooks
- WebSocket/Socket.io hooks for real-time features

## Architectural Patterns

### Backend Patterns

#### MVC Architecture
- **Models**: Mongoose schemas define data structure and validation
- **Controllers**: Handle business logic and orchestrate operations
- **Routes**: Map HTTP endpoints to controller methods
- **Middleware**: Cross-cutting concerns (auth, validation, errors)

#### Repository Pattern
- Models encapsulate database operations
- Controllers interact with models, not direct database queries
- Promotes testability and separation of concerns

#### Service Layer Pattern
- Complex operations (matching algorithm, escrow) isolated in utility modules
- Controllers remain thin, delegating to services
- Reusable business logic across multiple controllers

#### Queue-Based Background Processing
- Bull queues with Redis for async operations
- Reliability updates processed after job completion
- Scheduled reminders and maintenance tasks
- Scalable and fault-tolerant job processing

### Frontend Patterns

#### Component Composition
- Small, focused components with single responsibilities
- Composition over inheritance for UI building
- Props-based communication between components

#### Context API for State Management
- Global state (auth, theme) managed via Context
- Avoids prop drilling for deeply nested components
- Lightweight alternative to Redux for this scale

#### Custom Hooks Pattern
- Encapsulate reusable logic (data fetching, form handling)
- Promote code reuse across components
- Separate concerns from UI rendering

#### Service Layer Pattern
- API calls abstracted into service modules
- Components don't directly use axios
- Centralized error handling and request configuration

### Cross-Cutting Patterns

#### RESTful API Design
- Resource-based URLs (/api/jobs, /api/profiles)
- HTTP verbs for operations (GET, POST, PUT, DELETE)
- Consistent response formats and status codes

#### JWT Authentication
- Stateless authentication with access tokens
- Refresh token rotation for security
- Role-based authorization middleware

#### Real-Time Communication
- Socket.io for bidirectional communication
- Event-based messaging system
- Automatic reconnection handling

#### Containerization
- Docker for consistent environments
- Docker Compose for multi-service orchestration
- Separate containers for backend, frontend, MongoDB, Redis

## Component Relationships

### Data Flow
1. **User Request**: Frontend → API Service → Backend Route
2. **Authentication**: Middleware validates JWT → Attaches user to request
3. **Business Logic**: Controller → Model/Service → Database
4. **Response**: Database → Model → Controller → Route → Frontend
5. **Real-Time**: Socket.io event → Backend → Broadcast → Connected clients

### Key Interactions
- **Job Discovery**: Professional requests jobs → Matching algorithm scores all open jobs → Returns ranked results
- **Application Flow**: Professional applies → Organizer reviews → Accepts/rejects → Status updates trigger notifications
- **Escrow Lifecycle**: Organizer creates escrow → Stripe holds payment → Job completes → Payment released to professional
- **Reliability Updates**: Job completes/no-show → Queue job → Background worker updates score → Affects future matching
- **Chat System**: User sends message → Saved to database → Socket.io broadcasts → Recipient receives real-time update

## Database Schema Relationships

- **User** ↔ **Profile**: One-to-one (professionals only)
- **User** ↔ **Job**: One-to-many (organizers create jobs)
- **Job** ↔ **Application**: One-to-many (multiple pros apply)
- **User** ↔ **Application**: One-to-many (pros have multiple applications)
- **Application** ↔ **Review**: One-to-one (review after completion)
- **Job** ↔ **EscrowTransaction**: One-to-many (multiple payments per job)
- **User** ↔ **Chat**: Many-to-many (users participate in multiple chats)
- **Chat** ↔ **Message**: One-to-many (messages belong to chats)
