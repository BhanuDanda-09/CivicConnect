// ==============================================================================
// Real-Time Socket.IO Service (socketService.js)
// Authenticated user rooms, role rooms, and live telemetry dispatch
// ==============================================================================

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

/**
 * Initializes Socket.IO on the provided HTTP server
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    'https://civic-connect-two-mu.vercel.app',
    'https://civicconnect-src.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const isAllowedSocketOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app(?::\d+)?$/.test(origin)) return true;
    if (/^http:\/\/(localhost|127\.0\.0\.1):[0-9]+$/.test(origin)) return true;
    return false;
  };

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedSocketOrigin(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      // Extract token from auth payload, authorization header, or cookies
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization &&
          socket.handshake.headers.authorization.startsWith('Bearer ') &&
          socket.handshake.headers.authorization.split(' ')[1]) ||
        (socket.handshake.headers.cookie &&
          socket.handshake.headers.cookie
            .split(';')
            .find((c) => c.trim().startsWith('token='))
            ?.split('=')[1]);

      if (!token) {
        return next(new Error('Authentication failed: Bearer token is missing.'));
      }

      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_civicconnect_change_in_production';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication failed: User no longer exists.'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication failed: Account has been deactivated.'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Socket authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const userId = user._id.toString();
    const userRoom = `user:${userId}`;
    const roleRoom = `role:${user.role}`;

    // Join private user room and role-specific broadcast room
    socket.join(userRoom);
    socket.join(roleRoom);

    console.log(`[Socket.IO] Connected: ${user.fullName} (${user.role}) | Joined: ${userRoom}, ${roleRoom}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Disconnected: ${user.fullName} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket.IO] Socket error for ${user.fullName}:`, err.message);
    });
  });

  return io;
};

/**
 * Returns the active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Warning: getIO called before initSocket or in mock mode.');
    return null;
  }
  return io;
};

/**
 * Emits an event to a specific authenticated user's private room
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} event
 * @param {any} data
 */
const emitToUser = (userId, event, data) => {
  if (!io) return false;
  try {
    io.to(`user:${userId.toString()}`).emit(event, data);
    return true;
  } catch (err) {
    console.warn(`[Socket.IO] Failed to emit to user ${userId}:`, err.message);
    return false;
  }
};

/**
 * Emits an event to all users with a specific role (e.g. 'admin', 'worker', 'citizen')
 * @param {'admin'|'worker'|'citizen'} role
 * @param {string} event
 * @param {any} data
 */
const emitToRole = (role, event, data) => {
  if (!io) return false;
  try {
    io.to(`role:${role}`).emit(event, data);
    return true;
  } catch (err) {
    console.warn(`[Socket.IO] Failed to emit to role ${role}:`, err.message);
    return false;
  }
};

/**
 * Emits an event to all connected clients
 * @param {string} event
 * @param {any} data
 */
const emitToAll = (event, data) => {
  if (!io) return false;
  try {
    io.emit(event, data);
    return true;
  } catch (err) {
    console.warn('[Socket.IO] Failed to emit to all:', err.message);
    return false;
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToAll,
};

