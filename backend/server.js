// ==============================================================================
// Server Entry Point (server.js)
// Handles database initialization, HTTP/Socket.IO binding, and graceful shutdown
// ==============================================================================

const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');
const { initSocket } = require('./services/socketService');

const PORT = parseInt(process.env.PORT, 10) || 5000;
let server;

/**
 * Boots the database, initializes real-time WebSockets, and starts the HTTP server
 */
const startServer = async () => {
  try {
    // 1. Establish database connection before accepting traffic
    console.log('[CivicConnect Server] Initializing MongoDB connection...');
    await connectDB();

    // 2. Wrap Express app in standard Node HTTP server for WebSocket integration
    server = http.createServer(app);

    // 3. Initialize authenticated Socket.IO service
    initSocket(server);

    // 4. Start HTTP listener
    server.listen(PORT, () => {
      console.log('------------------------------------------------------------');
      console.log(`🏛️  CivicConnect API Server running on port ${PORT}`);
      console.log(`🌐  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡  Real-Time   : Socket.IO initialized on ws://localhost:${PORT}`);
      console.log(`🩺  Health Check: http://localhost:${PORT}/api/health`);
      console.log('------------------------------------------------------------');
    });
  } catch (error) {
    console.error('[CivicConnect Server Error] Critical startup failure:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('[CivicConnect Server] Running in dev fallback mode: starting server with DB offline.');
      server = http.createServer(app);
      initSocket(server);
      server.listen(PORT, () => {
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
      console.log('[CivicConnect Server] HTTP & Socket.IO server closed.');
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
