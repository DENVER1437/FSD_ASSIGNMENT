import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDBConnected, disconnectDB, validateDbConfig, sanitizeMongoUri, getDBStatus } from './config/db.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { validateJwtConfig } from './utils/jwt.js';
import { requireDB } from './middleware/requireDB.js';

// Load environment variables
dotenv.config();

// Validate core configuration before handling requests
validateJwtConfig();
validateDbConfig();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Parsing Middleware
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    ...clientUrls,
  ]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-to-server curl, verification scripts, Docker internal proxy)
      if (!origin) {
        return callback(null, true);
      }
      const normalizedOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      // Automatically permit any Vercel deployment domain (including preview URLs)
      if (normalizedOrigin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production') {
        // In development, permit localhost variations
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
      }
      console.warn(`[CORS Blocked]: Origin '${origin}' is not authorized. Allowed origins:`, allowedOrigins);
      return callback(new Error(`Blocked by CORS policy: origin '${origin}' is not authorized.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
  const dbStatus = getDBStatus();
  if (dbStatus.connected) {
    return res.status(200).json({
      status: 'ready',
      success: true,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } else {
    return res.status(503).json({
      status: 'not_ready',
      success: false,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount Core Application Routes (Protected with database readiness verification)
app.use('/api/auth', requireDB, authRoutes);
app.use('/api/users', requireDB, userRoutes);
app.use('/api/preferences', requireDB, preferenceRoutes);
app.use('/api/matches', requireDB, matchRoutes);
app.use('/api/requests', requireDB, requestRoutes);
app.use('/api/admin', requireDB, adminRoutes);

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

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[FATAL PORT ERROR]: Port ${PORT} is already occupied by another process.`);
        console.error(`To diagnose the occupying process on Windows, run: netstat -ano | findstr :${PORT}`);
        console.error(`If running Docker simultaneously, ensure Docker backend host port is mapped to 5001 ("5001:5000") in docker-compose.yml so host port 5000 remains available for local development.`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('[Startup Error]: Could not establish MongoDB connection.', sanitizeMongoUri(error.message));
    // Allow server to run so health probes can diagnose, but log failure
    server = app.listen(PORT, () => {
      console.log(`[NestMatch Server] Running in DEGRADED mode on port ${PORT} (Database Offline)`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[FATAL PORT ERROR]: Port ${PORT} is already occupied by another process.`);
        console.error(`To diagnose the occupying process on Windows, run: netstat -ano | findstr :${PORT}`);
        process.exit(1);
      }
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
