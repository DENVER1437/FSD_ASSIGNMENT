import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env if present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware configuration
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phase 0 Health Check / API Base Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    project: 'NestMatch – Smart Roommate Compatibility Finder',
    phase: 'Phase 0 — Project Foundation',
    timestamp: new Date().toISOString(),
  });
});

// Root API Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to NestMatch API service. Use /api/health for system status.',
  });
});

// 404 Not Found Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

// Start Server Listener
app.listen(PORT, () => {
  console.log(`[NestMatch Server] Running on http://localhost:${PORT}`);
  console.log(`[CORS Configured] Allowed Client Origin: ${CLIENT_URL}`);
  console.log(`[Health Endpoint] Available at http://localhost:${PORT}/api/health`);
});

export default app;
