import mongoose from 'mongoose';

/**
 * Connect to MongoDB database instance.
 * Supports MONGODB_URI and MONGO_URI with local fallback.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nestmatch';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    throw error;
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
