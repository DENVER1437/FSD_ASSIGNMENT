import { isDBConnected } from '../config/db.js';

/**
 * Middleware that ensures MongoDB is connected before proceeding to database-dependent handlers.
 * Returns controlled 503 Service Unavailable if database connection is offline.
 */
export const requireDB = (req, res, next) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      status: 'error',
      success: false,
      message: 'Database service is currently unavailable. Please try again shortly.',
      retryAfter: 5,
    });
  }
  next();
};

export default requireDB;
