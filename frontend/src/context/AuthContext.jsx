import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_USERS, USER_ROLES } from '../utils/constants';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load initial user from localStorage if saved
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('civic_user') || localStorage.getItem('civic_demo_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('civic_token') || null);
  const [loading, setLoading] = useState(false);

  // Synchronize authentication state to localStorage
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('civic_user', JSON.stringify(user));
      localStorage.setItem('civic_token', token);
    } else if (!user && !token) {
      localStorage.removeItem('civic_user');
      localStorage.removeItem('civic_demo_user');
      localStorage.removeItem('civic_token');
    }
  }, [user, token]);

  // Check and verify active session with the backend on initial load
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('civic_token');
      // If we have a JWT token (not a local demo placeholder), revalidate with backend
      if (storedToken && !storedToken.startsWith('demo_jwt_')) {
        setLoading(true);
        try {
          const res = await authAPI.getMe();
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          // If token is invalid or expired (401), clean up
          if (err.response?.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('civic_user');
            localStorage.removeItem('civic_token');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    verifySession();
  }, []);

  // Login handler: Calls backend /api/auth/login, with graceful offline fallback
  const login = async (email, password, roleHint = null) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data?.success) {
        const receivedUser = res.data.user;
        const receivedToken = res.data.token;
        setUser(receivedUser);
        setToken(receivedToken);
        localStorage.setItem('civic_user', JSON.stringify(receivedUser));
        localStorage.setItem('civic_token', receivedToken);
        return { success: true, user: receivedUser, token: receivedToken, message: res.data.message };
      }
      return { success: false, error: res.data?.message || 'Login failed' };
    } catch (err) {
      // If server responded with an error (400, 401, 403, 429), return the actual server message
      if (err.response && err.response.data) {
        const errorMsg =
          err.response.data.message ||
          (err.response.data.errors && err.response.data.errors[0]?.msg) ||
          'Invalid email or password';
        return { success: false, error: errorMsg };
      }

      // If backend server is unreachable (Network error / offline), fall back to demo mode
      console.warn('Backend server unreachable; falling back to local demo authentication session:', err.message);

      let fallbackUser = DEMO_USERS.citizen;
      if (roleHint === USER_ROLES.ADMIN || email.toLowerCase().includes('admin')) {
        fallbackUser = DEMO_USERS.admin;
      } else if (roleHint === USER_ROLES.WORKER || email.toLowerCase().includes('worker')) {
        fallbackUser = DEMO_USERS.worker;
      } else {
        fallbackUser = {
          ...DEMO_USERS.citizen,
          email: email || DEMO_USERS.citizen.email,
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Citizen User',
        };
      }

      const demoToken = `demo_jwt_${fallbackUser.role}_${Date.now()}`;
      setUser(fallbackUser);
      setToken(demoToken);
      localStorage.setItem('civic_user', JSON.stringify(fallbackUser));
      localStorage.setItem('civic_token', demoToken);

      return { success: true, user: fallbackUser, token: demoToken, isDemoFallback: true };
    }
  };

  // Register handler: Calls backend /api/auth/register (strictly citizen)
  const register = async (registrationData) => {
    try {
      const res = await authAPI.register(registrationData);
      if (res.data?.success) {
        const receivedUser = res.data.user;
        const receivedToken = res.data.token;
        setUser(receivedUser);
        setToken(receivedToken);
        localStorage.setItem('civic_user', JSON.stringify(receivedUser));
        localStorage.setItem('civic_token', receivedToken);
        return { success: true, user: receivedUser, token: receivedToken, message: res.data.message };
      }
      return { success: false, error: res.data?.message || 'Registration failed' };
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMsg =
          err.response.data.message ||
          (err.response.data.errors && err.response.data.errors[0]?.msg) ||
          'Registration failed';
        return { success: false, error: errorMsg };
      }

      console.warn('Backend server unreachable; creating local demo citizen session:', err.message);
      const newUser = {
        id: `usr_c_${Date.now()}`,
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        address: registrationData.address,
        role: USER_ROLES.CITIZEN,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      };

      const demoToken = `demo_jwt_citizen_${Date.now()}`;
      setUser(newUser);
      setToken(demoToken);
      localStorage.setItem('civic_user', JSON.stringify(newUser));
      localStorage.setItem('civic_token', demoToken);

      return { success: true, user: newUser, token: demoToken, isDemoFallback: true };
    }
  };

  // Switch demo persona directly from UI navbar or quick controls
  const switchDemoRole = useCallback((role) => {
    let selectedUser = DEMO_USERS.citizen;
    if (role === USER_ROLES.ADMIN) {
      selectedUser = DEMO_USERS.admin;
    } else if (role === USER_ROLES.WORKER) {
      selectedUser = DEMO_USERS.worker;
    }

    const demoToken = `demo_jwt_${selectedUser.role}_${Date.now()}`;
    setUser(selectedUser);
    setToken(demoToken);
    localStorage.setItem('civic_user', JSON.stringify(selectedUser));
    localStorage.setItem('civic_token', demoToken);
  }, []);

  // Logout handler
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('civic_user');
      localStorage.removeItem('civic_demo_user');
      localStorage.removeItem('civic_token');
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isWorker: user?.role === USER_ROLES.WORKER,
    isCitizen: user?.role === USER_ROLES.CITIZEN,
    loading,
    login,
    register,
    logout,
    switchDemoRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
