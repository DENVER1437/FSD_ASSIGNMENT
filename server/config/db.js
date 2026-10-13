import mongoose from 'mongoose';

/**
 * Connect to MongoDB database instance
 * Ready for Phase 3 activation when MONGO_URI is configured.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};
