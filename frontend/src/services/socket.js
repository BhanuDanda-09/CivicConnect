// ==============================================================================
// Real-Time Socket.IO Client Service (socket.js)
// Singleton connection lifecycle, event subscriptions, and token auth
// ==============================================================================

import { io } from 'socket.io-client';

let socket = null;

/**
 * Derives the WebSocket base URL from environment configuration
 */
const getSocketBaseUrl = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api';

  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:5000';
  }
};

/**
 * Initializes and connects the Socket.IO client with Bearer auth token
 * @param {string} [token] - JWT token from localStorage or AuthContext
 * @returns {import('socket.io-client').Socket}
 */
export const connectSocket = (token) => {
  const authToken = token || localStorage.getItem('civic_token');

  if (!authToken) {
    console.warn('[Socket.IO Client] Cannot connect: No auth token present in session.');
    return null;
  }

  // Reuse existing connected socket
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  const serverUrl = getSocketBaseUrl();

  socket = io(serverUrl, {
    auth: { token: authToken },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log(`[Socket.IO Client] Connected to ${serverUrl} (Socket ID: ${socket.id})`);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO Client] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO Client] Disconnected:', reason);
  });

  return socket;
};

/**
 * Safely disconnects the socket on logout or unmount
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket.IO Client] Socket disconnected and purged.');
  }
};

/**
 * Returns active socket instance
 */
export const getSocket = () => socket;

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
};

