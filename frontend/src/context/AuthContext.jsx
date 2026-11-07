import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('civic_demo_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return DEMO_USERS.citizen;
      }
    }
    return DEMO_USERS.citizen; // Default to demo citizen for easy immediate exploration
  });

  const [token, setToken] = useState(() => localStorage.getItem('civic_token') || 'demo_jwt_token_phase2');

  useEffect(() => {
    if (user) {
      localStorage.setItem('civic_demo_user', JSON.stringify(user));
      localStorage.setItem('civic_token', token || 'demo_jwt_token_phase2');
    } else {
      localStorage.removeItem('civic_demo_user');
      localStorage.removeItem('civic_token');
    }
  }, [user, token]);

  // Demo Login Handler
  const login = (email, password, roleHint = null) => {
    // Check if matching a demo user
    let selectedUser = null;

    if (roleHint === USER_ROLES.ADMIN || email.toLowerCase().includes('admin')) {
      selectedUser = DEMO_USERS.admin;
    } else if (roleHint === USER_ROLES.WORKER || email.toLowerCase().includes('worker')) {
      selectedUser = DEMO_USERS.worker;
    } else {
      selectedUser = {
        ...DEMO_USERS.citizen,
        email: email || DEMO_USERS.citizen.email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Citizen User'
      };
    }

    setUser(selectedUser);
    setToken(`demo_jwt_${selectedUser.role}_${Date.now()}`);
    return { success: true, user: selectedUser };
  };

  // Switch demo persona directly from UI navbar
  const switchDemoRole = (role) => {
    if (role === USER_ROLES.ADMIN) {
      setUser(DEMO_USERS.admin);
    } else if (role === USER_ROLES.WORKER) {
      setUser(DEMO_USERS.worker);
    } else {
      setUser(DEMO_USERS.citizen);
    }
  };

  // Demo Registration Handler
  const register = (registrationData) => {
    const newUser = {
      id: `usr_c_${Date.now()}`,
      name: registrationData.name,
      email: registrationData.email,
      phone: registrationData.phone,
      address: registrationData.address,
      role: USER_ROLES.CITIZEN,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    setUser(newUser);
    setToken(`demo_jwt_citizen_${Date.now()}`);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('civic_demo_user');
    localStorage.removeItem('civic_token');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isWorker: user?.role === USER_ROLES.WORKER,
    isCitizen: user?.role === USER_ROLES.CITIZEN,
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
