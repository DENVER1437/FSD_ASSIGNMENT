import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDBConnected, disconnectDB } from './config/db.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Validate core configuration
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('[FATAL CONFIG ERROR]: JWT_SECRET environment variable is missing in production.');
  process.exit(1);
}

// Security & Parsing Middleware
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...clientUrls,
  ]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== 'production') {
        callback(null, true); // Permissive in dev to avoid blocking testers
      } else {
        callback(new Error(`Blocked by CORS policy: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Welcome to NestMatch REST API service.',
    documentation: '/api/health',
  });
});

// Lightweight Health Check (Public)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    success: true,
    project: 'NestMatch – Smart Roommate Compatibility Finder',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Readiness Probe (Verifies MongoDB Connectivity)
app.get('/api/ready', (req, res) => {
  const dbConnected = isDBConnected();
  if (dbConnected) {
    return res.status(200).json({
      status: 'ready',
      success: true,
      database: {
        status: 'connected',
        connected: true,
      },
      timestamp: new Date().toISOString(),
    });
  } else {
    return res.status(503).json({
      status: 'not_ready',
      success: false,
      database: {
        status: 'disconnected',
        connected: false,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount Core Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// 404 Catch-All & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Server Lifecycle Management
let server;

const startServer = async () => {
  try {
    // Connect to database before accepting requests
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`[NestMatch Server] Active on port ${PORT}`);
      console.log(`[Health Endpoint] http://localhost:${PORT}/api/health`);
      console.log(`[Readiness Probe] http://localhost:${PORT}/api/ready`);
    });
  } catch (error) {
    console.error('[Startup Error]: Could not establish MongoDB connection.', error.message);
    // Allow server to run so health probes can diagnose, but log failure
    server = app.listen(PORT, () => {
      console.log(`[NestMatch Server] Running in DEGRADED mode on port ${PORT} (Database Offline)`);
    });
  }
};

startServer();

// Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`\n[${signal}] Initiating graceful server shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[HTTP Server] Closed active connections.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default app;
