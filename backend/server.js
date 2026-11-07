// ==============================================================================
// Server Entry Point (server.js)
// Handles database initialization, port binding, and graceful shutdown
// ==============================================================================

const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;
let server;

/**
 * Boots the database and starts the HTTP server
 */
const startServer = async () => {
  try {
    // 1. Establish database connection before accepting traffic
    console.log('[CivicConnect Server] Initializing MongoDB connection...');
    await connectDB();

    // 2. Start HTTP listener
    server = app.listen(PORT, () => {
      console.log('------------------------------------------------------------');
      console.log(`🏛️  CivicConnect API Server running on port ${PORT}`);
      console.log(`🌐  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`🩺  Health Check: http://localhost:${PORT}/api/health`);
      console.log('------------------------------------------------------------');
    });
  } catch (error) {
    console.error('[CivicConnect Server Error] Critical startup failure:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('[CivicConnect Server] Running in dev fallback mode: starting server with DB offline.');
      // In local dev without MongoDB running, start server so developer can still check health/routes
      server = app.listen(PORT, () => {
        console.log(`[CivicConnect Server] HTTP Server running on port ${PORT} (Database offline)`);
      });
    }
  }
};

// Graceful Shutdown Handlers
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[CivicConnect Server] Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log('[CivicConnect Server] HTTP server closed.');
      try {
        await disconnectDB();
        console.log('[CivicConnect Server] Clean exit completed.');
        process.exit(0);
      } catch (err) {
        console.error('[CivicConnect Server Error] Error during DB disconnect:', err.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

// Prevent unhandled promise rejections from crashing without logging
process.on('unhandledRejection', (err) => {
  console.error('[CivicConnect Server Error] Unhandled Promise Rejection:', err);
});

// Start server if not running inside a test runner (Jest)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
