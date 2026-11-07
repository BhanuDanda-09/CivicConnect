// ==============================================================================
// MongoDB Connection & Lifecycle Manager (Mongoose)
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Reads MONGODB_URI from environment variables
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  // Mask credentials in logs for security
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`[CivicConnect DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[CivicConnect DB Error] Failed to connect to ${maskedUri}:`, error.message);
    throw error;
  }
};

/**
 * Returns true if mongoose connection is open and active
 * readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Disconnect from MongoDB (used for clean server shutdown & Jest test teardown)
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[CivicConnect DB] Disconnected from MongoDB.');
  }
};

// Listen to connection lifecycle events
mongoose.connection.on('disconnected', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[CivicConnect DB] Warning: Lost connection to MongoDB.');
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('[CivicConnect DB] Re-established connection to MongoDB.');
});

module.exports = {
  connectDB,
  isDBConnected,
  disconnectDB,
};
