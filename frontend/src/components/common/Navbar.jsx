// ==============================================================================
// Professional Redesigned Navbar (Navbar.jsx)
// Role-based navigation, active indicator, text-size controls & responsive mobile drawer
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import {
  Menu,
  X,
  Bell,
  User,
  Shield,
  HardHat,
  LogOut,
  ChevronDown,
  Building2,
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Search,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const demoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleRoleSelect = (newRole) => {
    switchDemoRole(newRole);
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'worker') navigate('/worker/dashboard');
    else navigate('/citizen/dashboard');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'worker') return '/worker/dashboard';
    return '/citizen/dashboard';
  };

  // Role-Specific Navigation Definitions
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Report Complaint', path: '/citizen/submit-complaint' },
        { label: 'Track Complaint', path: '/track' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Complaints', path: '/admin/complaints' },
        { label: 'Departments', path: '/admin/departments' },
        { label: 'Workers', path: '/admin/workers' },
        { label: 'Analytics', path: '/admin/analytics' },
      ];
    }

    if (user?.role === 'worker') {
      return [
        { label: 'Dashboard', path: '/worker/dashboard' },
        { label: 'Assigned Tasks', path: '/worker/tasks' },
        { label: 'Complaints', path: '/worker/dashboard' },
      ];
    }

    // Default to Citizen
    return [
      { label: 'Home', path: '/' },
      { label: 'Report Complaint', path: '/citizen/submit-complaint' },
      { label: 'Track Complaint', path: '/track' },
      { label: 'My Complaints', path: '/citizen/complaints' },
    ];
  };

  const navLinks = getNavLinks();

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700/50 flex items-center justify-center text-sky-400 font-black shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Civic<span className="text-sky-600 dark:text-sky-400">Connect</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Smart Governance
                </span>
              </div>
            </Link>

            {/* 2. Desktop Navigation Items (Role-Based) */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const active = isLinkActive(item.path);
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3. Right-Side Actions (Theme, Role Switcher, Notifications & Profile) */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Dark / Light Mode Toggle */}
            <ThemeToggle size="sm" />

            {/* Subtle Demo Role Switcher */}
            <div className="relative" ref={demoRef}>
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Switch Demo Role"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="capitalize">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    Select Test Role
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('citizen')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Citizen Persona</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Admin Persona</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('worker')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <HardHat className="w-3.5 h-3.5 text-amber-600" />
                    <span>Field Worker Persona</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell (Authenticated Users) */}
            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900"></span>
              </Link>
            )}

            {/* User Profile Dropdown or Login/Register */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-expanded={profileDropdownOpen}
                  aria-label="Open user profile menu"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={user?.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user?.name || user?.fullName || 'Profile'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name || user?.fullName || 'Citizen User'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'citizen@civicconnect.gov.in'}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                        {user?.role || 'Citizen'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dashboard</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/audit-logs"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Shield className="w-3.5 h-3.5 text-slate-400" />
                            <span>System Audit Log</span>
                          </Link>
                          <Link
                            to="/admin/assets"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Civic Asset Registry</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* 4. Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle size="sm" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          {/* Role-Specific Links on Mobile */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const active = isLinkActive(item.path);
              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Demo Persona Quick Switcher on Mobile */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Switch Role</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('citizen')}
                className={`py-2 text-center rounded-xl text-xs font-bold border transition-colors ${
                  user?.role === 'citizen'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-700 dark:text-sky-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 text-center rounded-xl text-xs font-bold border transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('worker')}
                className={`py-2 text-center rounded-xl text-xs font-bold border transition-colors ${
                  user?.role === 'worker'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Worker
              </button>
            </div>
          </div>

          {/* Authentication Actions on Mobile */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
                >
                  Go to {user?.role === 'admin' ? 'Admin' : user?.role === 'worker' ? 'Worker' : 'Citizen'} Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded-xl text-rose-600 dark:text-rose-400 font-bold text-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
