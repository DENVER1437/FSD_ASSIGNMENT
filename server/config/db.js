import mongoose from 'mongoose';
import dns from 'node:dns';

// Ensure reliable DNS resolution for MongoDB Atlas SRV records on Windows environments
// where c-ares defaults to 127.0.0.1 when IPv6 DNS is primary on the network adapter.
try {
  if (typeof dns.getServers === 'function') {
    const currentServers = dns.getServers();
    if (!currentServers || currentServers.length === 0 || currentServers.every((s) => s === '127.0.0.1')) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
  }
} catch {
  // Best effort fallback - do not halt execution if restricted
}

/**
 * Strips authentication credentials from MongoDB URIs or error messages.
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
 * Classifies MongoDB connection failures into actionable diagnostics
 * without exposing sensitive credentials.
 *
 * @param {Error} error - Raw connection error
 * @returns {string} Human-readable root-cause explanation
 */
export const diagnoseConnectionError = (error) => {
  const message = error?.message || '';
  if (message.includes('querySrv') || message.includes('ENOTFOUND')) {
    if (message.includes('ECONNREFUSED')) {
      return 'DNS SRV Resolver Error (ECONNREFUSED): Local DNS resolver failed to resolve SRV records on port 53. Node.js DNS servers have been configured with public resolvers (8.8.8.8, 1.1.1.1).';
    }
    return 'DNS Resolution Failure: The cluster host could not be resolved. If using MongoDB Atlas, verify that your MONGODB_URI in server/.env has been updated with your real cluster host instead of placeholder text.';
  }
  if (message.includes('ETIMEDOUT') || message.includes('ECONNREFUSED') || message.includes('Server selection timed out')) {
    return 'Network / Firewall Timeout: Unable to reach the MongoDB cluster. In MongoDB Atlas, verify that your current public IP address is added to Security -> Network Access (or 0.0.0.0/0).';
  }
  if (message.includes('bad auth') || message.includes('Authentication failed') || message.includes('auth error')) {
    return 'Authentication Failed: The database username or password in MONGODB_URI is incorrect. Verify credentials in MongoDB Atlas Security -> Database Access.';
  }
  if (message.includes('certificate') || message.includes('TLS') || message.includes('SSL')) {
    return 'TLS/SSL Handshake Error: Connection failed during TLS negotiation. Verify your network or proxy settings allow outbound TLS on port 27017.';
  }
  if (message.includes('Invalid scheme') || message.includes('Invalid connection string')) {
    return 'URI Syntax Error: The connection string format is invalid. Expected format: mongodb+srv://<user> : <password> @ <cluster>.mongodb.net/<database>';
  }
  return 'Connection Error: ' + sanitizeMongoUri(message);
};

/**
 * Validates database environment configuration at startup.
 * Enforces MONGODB_URI in all environments.
 * Detects unconfigured placeholders and warns explicitly.
 */
export const validateDbConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri || !uri.trim()) {
    const errorMsg = isProduction
      ? 'Database configuration error: MONGODB_URI environment variable is required in production.'
      : 'Database configuration error: MONGODB_URI environment variable is required. Please configure MONGODB_URI in server/.env.';
    console.error(`[FATAL CONFIG ERROR]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Detect unreplaced template placeholders
  if (
    uri.includes('YOUR_CLUSTER_HOST') ||
    uri.includes('<cluster>') ||
    uri.includes('URL_ENCODED_PASSWORD') ||
    uri.includes('<password>') ||
    uri.includes('replace_with_your')
  ) {
    console.warn('[MongoDB Config Warning]: MONGODB_URI contains unconfigured template placeholder (YOUR_CLUSTER_HOST / <cluster>). Backend will operate in degraded mode until real Atlas credentials are set in server/.env.');
  }

  return true;
};

// Register connection event listeners once
let listenersInitialized = false;
const initConnectionListeners = () => {
  if (listenersInitialized) return;
  listenersInitialized = true;

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB Event]: Connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB Event Error]: ${sanitizeMongoUri(err.message)}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Event]: Database connection disconnected.');
  });
};

/**
 * Connect to MongoDB database instance.
 * Connects using standardized MONGODB_URI.
 * Supports connection deduplication and timeout protection.
 */
export const connectDB = async () => {
  validateDbConfig();
  initConnectionListeners();

  // If already connected, reuse existing active connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  uri = uri.replace(/^MONGODB_URI=|^MONGO_URI=/, '').trim();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    const diagnostic = diagnoseConnectionError(error);
    const sanitizedMsg = sanitizeMongoUri(error.message);
    console.error(`[MongoDB Connection Error]: ${sanitizedMsg}`);
    console.error(`[MongoDB Diagnostic]: ${diagnostic}`);

    const safeError = new Error(sanitizedMsg);
    safeError.code = error.code;
    safeError.diagnostic = diagnostic;
    throw safeError;
  }
};

/**
 * Get comprehensive, safe database connection status.
 *
 * @returns {object} Status object suitable for /api/ready probe
 */
export const getDBStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongoose.connection.readyState;
  const isConnected = stateIndex === 1;

  return {
    connected: isConnected,
    status: isConnected ? 'connected' : 'disconnected',
    state: states[stateIndex] || 'unknown',
    readyState: stateIndex,
    host: isConnected ? mongoose.connection.host : null,
    database: isConnected ? mongoose.connection.name : null,
  };
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
