// ==============================================================================
// Real-Time Socket & Notification Context (SocketContext.jsx)
// Provides live notification counts, toasts, and reactive data events
// ==============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch persisted notifications from MongoDB backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingNotifications(true);
      const res = await notificationAPI.getAll({ limit: 15 });
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[SocketContext] Could not load persisted notifications:', err.message);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  // Connect socket when user is authenticated, disconnect on logout
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('civic_token');
      const activeSocket = connectSocket(token);

      if (activeSocket) {
        setSocket(activeSocket);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        activeSocket.on('connect', handleConnect);
        activeSocket.on('disconnect', handleDisconnect);

        // Real-time notification received
        const handleNotification = (notif) => {
          setNotifications((prev) => [notif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Pop an ambient toast notification
          toast(
            (t) => (
              <div className="flex items-start gap-2.5">
                <span className="text-base">🔔</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-xs text-white">{notif.title}</p>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{notif.message}</p>
                </div>
              </div>
            ),
            { duration: 4500 }
          );
        };

        const handleCount = ({ unreadCount }) => {
          setUnreadCount(unreadCount);
        };

        activeSocket.on('notification:received', handleNotification);
        activeSocket.on('notification:count', handleCount);

        // General status change toasts for field operations
        const handleComplaintUpdated = (data) => {
          console.log('[Socket Event] complaint:updated', data);
        };

        activeSocket.on('complaint:updated', handleComplaintUpdated);

        fetchNotifications();

        return () => {
          activeSocket.off('connect', handleConnect);
          activeSocket.off('disconnect', handleDisconnect);
          activeSocket.off('notification:received', handleNotification);
          activeSocket.off('notification:count', handleCount);
          activeSocket.off('complaint:updated', handleComplaintUpdated);
        };
      }
    } else {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const res = await notificationAPI.markAsRead(id);
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(res.data.unreadCount ?? Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.warn('Could not mark notification as read:', err.message);
      // Local fallback
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await notificationAPI.markAllAsRead();
      if (res.data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn('Could not mark all notifications as read:', err.message);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    loadingNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;

