import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_NAME } from '../../utils/constants';
import ThemeToggle from './ThemeToggle';
import AccessibilityToolbar from './AccessibilityToolbar';
import {
  Menu,
  X,
  Shield,
  User,
  HardHat,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Bell,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSelect = (newRole) => {
    switchDemoRole(newRole);
    setRoleMenuOpen(false);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'worker') navigate('/worker/dashboard');
    else navigate('/citizen/dashboard');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'worker') return '/worker/dashboard';
    return '/citizen/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center text-sky-400 font-black shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Civic<span className="text-sky-600 dark:text-sky-400">Connect</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                  Municipal Portal
                </span>
              </div>
            </Link>

            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex md:items-center md:space-x-1 ml-8">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/track"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/track')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Track Status
              </Link>
              <Link
                to="/community"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/community')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Community
              </Link>
              <Link
                to="/transparency"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/transparency')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Transparency
              </Link>
              <Link
                to="/help"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/help')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Help Desk
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/about')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/contact')
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right Header: Role Switcher & User Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Accessibility & Language Toolbar */}
            <AccessibilityToolbar />

            {/* Theme Toggle Button */}
            <ThemeToggle size="sm" />

            {/* Demo Persona Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                title="Switch demo persona for testing different roles"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Demo:</span>
                <span className="capitalize font-bold text-sky-700 dark:text-sky-400">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Switch Demo Persona
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Preview UI as different stakeholders</p>
                  </div>
                  <button
                    onClick={() => handleRoleSelect('citizen')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      user?.role === 'citizen' ? 'bg-sky-50 dark:bg-sky-950/40 font-semibold text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <div>
                      <p className="font-semibold">Citizen (Rahul Sharma)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">File & track civic issues</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      user?.role === 'admin' ? 'bg-sky-50 dark:bg-sky-950/40 font-semibold text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="font-semibold">Municipal Admin (Priya)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Verify, assign & analyze</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('worker')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      user?.role === 'worker' ? 'bg-sky-50 dark:bg-sky-950/40 font-semibold text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <HardHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-semibold">Field Worker (Ramesh)</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Execute repairs & upload proof</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 shadow-sm transition-all border border-transparent dark:border-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {user?.role === 'citizen' && (
                  <Link
                    to="/citizen/submit-complaint"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Issue</span>
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Mobile Theme Toggle */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle size="sm" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Track Complaint
            </Link>
            <Link
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Community Board
            </Link>
            <Link
              to="/transparency"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Public Transparency
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Help Desk
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Contact
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Demo Persona</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  handleRoleSelect('citizen');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                  user?.role === 'citizen'
                    ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => {
                  handleRoleSelect('admin');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                  user?.role === 'admin'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  handleRoleSelect('worker');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 text-center rounded-lg text-xs font-medium border transition-colors ${
                  user?.role === 'worker'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Worker
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded-xl text-rose-600 dark:text-rose-400 font-medium text-xs hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700"
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
