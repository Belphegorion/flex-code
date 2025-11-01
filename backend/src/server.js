import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import { startScheduledJobs } from './utils/scheduler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { securityHeaders, customSecurity } from './middleware/security.js';

// Routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import profileRoutes from './routes/profiles.js';
import applicationRoutes from './routes/applications.js';
import escrowRoutes from './routes/escrow.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import eventRoutes from './routes/events.js';
import profileSetupRoutes from './routes/profileSetup.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

// Connect to Database
connectDB();

// Start scheduled jobs
startScheduledJobs();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Compression
app.use(compression());

// Security Middleware
app.use(customSecurity);
if (process.env.NODE_ENV === 'production') {
  app.use(securityHeaders);
  app.use(apiLimiter);
}

// Socket.io setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (data) => {
    io.to(data.chatId).emit('receive-message', data);
  });

  socket.on('join-event', (eventId) => {
    socket.join(`event_${eventId}`);
  });

  socket.on('video-signal', (data) => {
    socket.to(data.to).emit('video-signal', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Health check (before routes to avoid auth)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/profile-setup', profileSetupRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;