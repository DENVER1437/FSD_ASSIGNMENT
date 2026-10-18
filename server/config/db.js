import mongoose from 'mongoose';

/**
 * Strips authentication credentials from MongoDB URIs or error messages
 * Prevents credentials from leaking into terminal, log aggregators, or traces.
 *
 * @param {string} input - Raw URI or error message
 * @returns {string} Sanitized string with user:password replaced by ***:***
 */
export const sanitizeMongoUri = (input = '') => {
  if (typeof input !== 'string') return '';
  return input.replace(/:\/\/([^:]+):([^@]+)@/g, '://***:***@');
};

/**
 * Validates database environment configuration.
 * In production, MONGODB_URI (or MONGO_URI) is strictly mandatory.
 * Rejects startup if absent rather than silently falling back to localhost.
 */
export const validateDbConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (isProduction && (!uri || !uri.trim())) {
    const errorMsg = 'Database configuration error: MONGODB_URI environment variable is required in production.';
    console.error(`[FATAL CONFIG ERROR]: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  return true;
};

/**
 * Connect to MongoDB database instance.
 * Supports MONGODB_URI and MONGO_URI with local fallback for development.
 * Never exposes raw credentials in logs or error messages.
 */
export const connectDB = async () => {
  validateDbConfig();

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nestmatch';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    const sanitizedError = sanitizeMongoUri(error.message);
    console.error(`[MongoDB Connection Error]: ${sanitizedError}`);
    const safeError = new Error(sanitizedError);
    safeError.code = error.code;
    throw safeError;
  }
};

/**
 * Check if MongoDB connection is active and healthy
 * readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Gracefully close MongoDB connection
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB Disconnected]: Connection closed');
  }
};
