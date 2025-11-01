# Technology Stack

## Programming Languages

### Backend
- **JavaScript (ES6+)**: Node.js runtime with ES modules (`"type": "module"`)
- **Version**: Node.js 18+ required

### Frontend
- **JavaScript (ES6+)**: Modern JavaScript with JSX syntax
- **JSX**: React component syntax
- **CSS**: Tailwind CSS utility classes

## Backend Technologies

### Core Framework
- **Express.js 5.1.0**: Web application framework
- **Node.js**: JavaScript runtime environment

### Database
- **MongoDB 7**: NoSQL document database
- **Mongoose 8.19.1**: ODM for MongoDB with schema validation

### Authentication & Security
- **jsonwebtoken 9.0.2**: JWT token generation and verification
- **bcryptjs 3.0.2**: Password hashing
- **express-validator 7.2.1**: Request validation middleware
- **cors 2.8.5**: Cross-origin resource sharing

### File Management
- **Multer 2.0.2**: Multipart form data handling
- **Cloudinary 2.7.0**: Cloud-based image and video storage

### Payment Processing
- **Stripe 19.1.0**: Payment gateway integration
- **QRCode 1.5.4**: QR code generation for tickets/check-ins

### Real-Time Communication
- **Socket.io 4.8.1**: WebSocket library for bidirectional communication

### Background Jobs & Scheduling
- **Bull 4.16.5**: Redis-based queue for background jobs
- **Redis 5.8.3**: In-memory data store for queues and caching
- **node-cron 4.2.1**: Cron job scheduler

### Email
- **Nodemailer 7.0.9**: Email sending library

### Development Tools
- **nodemon 3.1.10**: Auto-restart on file changes
- **ESLint 9.37.0**: Code linting
- **Prettier 3.6.2**: Code formatting
- **Husky 9.1.7**: Git hooks
- **dotenv 17.2.3**: Environment variable management

## Frontend Technologies

### Core Framework
- **React 19.2.0**: UI library
- **React DOM 19.2.0**: React renderer for web

### Build Tool
- **Vite 5.4.11**: Fast build tool and dev server
- **@vitejs/plugin-react 5.0.4**: React plugin for Vite

### Routing & State
- **React Router DOM 7.9.4**: Client-side routing
- **Context API**: Built-in React state management

### UI & Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing
- **Framer Motion 12.23.22**: Animation library
- **React Icons 5.5.0**: Icon library

### HTTP & Real-Time
- **Axios 1.12.2**: HTTP client
- **Socket.io Client 4.8.1**: WebSocket client

### UI Components & Utilities
- **React Toastify 11.0.5**: Toast notifications
- **date-fns 4.1.0**: Date manipulation library

### Development Tools
- **ESLint 9.37.0**: Code linting
- **eslint-plugin-react 7.37.5**: React-specific linting rules
- **eslint-plugin-react-hooks 7.0.0**: React Hooks linting
- **eslint-plugin-react-refresh 0.4.23**: React Fast Refresh linting
- **Prettier 3.6.2**: Code formatting
- **Husky 9.1.7**: Git hooks

## Infrastructure & DevOps

### Containerization
- **Docker**: Container platform
- **Docker Compose**: Multi-container orchestration

### Services
- **MongoDB 7**: Database container
- **Redis 7 Alpine**: Cache and queue container
- **Nginx**: Frontend web server (production)

### Environment Configuration
- **Backend Port**: 4000
- **Frontend Port**: 3000 (dev), 80 (production)
- **MongoDB Port**: 27017
- **Redis Port**: 6379

## Development Commands

### Backend Commands

```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run linter
npm run lint

# Format code
npm run format
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d mongo redis

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers
docker-compose up -d --build

# Remove volumes (clean slate)
docker-compose down -v
```

### Database Commands

```bash
# Connect to MongoDB
docker exec -it flex-code-mongo-1 mongosh eventflex

# Connect to Redis
docker exec -it flex-code-redis-1 redis-cli

# Check Redis keys
docker exec -it flex-code-redis-1 redis-cli KEYS "*"

# Check queue length
docker exec -it flex-code-redis-1 redis-cli LLEN "bull:reliability-updates:wait"
```

## API Endpoints

### Base URL
- Development: `http://localhost:4000/api`
- Production: Configured via `FRONTEND_URL` environment variable

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get current user profile

### Jobs
- `POST /jobs` - Create job (organizer)
- `GET /jobs` - Get organizer's jobs
- `GET /jobs/discover` - Discover jobs with ML matching (professional)
- `GET /jobs/:id` - Get job details
- `PUT /jobs/:id` - Update job
- `POST /jobs/:id/hire` - Hire professionals

### Applications
- `POST /applications/:id/apply` - Apply to job
- `GET /applications/my-applications` - Get user's applications
- `POST /applications/:id/accept` - Accept application
- `POST /applications/check-in` - Check in/out

### Profiles
- `POST /profiles` - Create/update profile
- `GET /profiles/search` - Search talent
- `GET /profiles/:id` - Get profile details
- `POST /profiles/video` - Upload video introduction

### Escrow
- `POST /escrow/create` - Create escrow transaction
- `POST /escrow/confirm` - Confirm payment
- `POST /escrow/:transactionId/release` - Release payment
- `GET /escrow/transactions` - Get user's transactions

### Chat
- `POST /chat/create` - Create or get chat
- `GET /chat` - Get user's chats
- `POST /chat/message` - Send message
- `PUT /chat/:chatId/read` - Mark messages as read

### Reviews
- `POST /reviews` - Create review
- `GET /reviews/:userId` - Get user's reviews

### Admin
- `POST /admin/no-show/:applicationId` - Mark no-show
- `POST /admin/reliability-update` - Trigger reliability update

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development|production
PORT=4000
MONGO_URI=mongodb://localhost:27017/eventflex
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STRIPE_SECRET_KEY=your-stripe-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## Build & Deployment

### Development
- Backend: `npm run dev` (nodemon with hot reload)
- Frontend: `npm run dev` (Vite dev server with HMR)
- Database: Docker Compose services

### Production
- Backend: Node.js server in Docker container
- Frontend: Static files served by Nginx in Docker container
- Database: MongoDB and Redis in Docker containers
- Orchestration: Docker Compose

### Build Process
1. Backend: No build step (ES modules run directly)
2. Frontend: Vite builds optimized static assets
3. Docker: Multi-stage builds for optimized images
4. Deployment: `docker-compose up -d` starts all services

## Testing Strategy
- Manual API testing via curl/Postman
- Frontend testing in browser
- Integration testing with full stack running
- No automated test suite currently implemented
