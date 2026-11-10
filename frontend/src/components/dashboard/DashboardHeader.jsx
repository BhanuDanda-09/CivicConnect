// ==============================================================================
// Dashboard Header Component (DashboardHeader.jsx)
// Phase 7 - Real-Time Notification Bell, Role Switcher, Dark Mode & Profile
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import {
  Menu,
  Bell,
  User,
  Shield,
  HardHat,
  ChevronDown,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Inbox,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function DashboardHeader({ onMenuClick, title, subtitle, action }) {
  const { user, role, switchDemoRole } = useAuth();
  const socketContext = useSocket();
  const notifications = socketContext?.notifications || [];
  const unreadCount = socketContext?.unreadCount || 0;
  const markAsRead = socketContext?.markAsRead;
  const markAllAsRead = socketContext?.markAllAsRead;

  const [roleDropdown, setRoleDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const notifRef = useRef(null);
  const roleRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (newRole) => {
    switchDemoRole(newRole);
    setRoleDropdown(false);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'worker') navigate('/worker/dashboard');
    else navigate('/citizen/dashboard');
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead && markAsRead) {
      markAsRead(notif._id || notif.id);
    }
    setNotifDropdown(false);

    if (notif.relatedComplaint) {
      const compId = notif.relatedComplaint.complaintId || notif.relatedComplaint._id || notif.relatedComplaint;
      if (role === 'admin') navigate('/admin/complaints');
      else if (role === 'worker') navigate('/worker/tasks');
      else navigate(`/citizen/complaints/${compId}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Actions, ThemeToggle, Notifications, Persona Switcher & Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {action && <div>{action}</div>}

        {/* Theme Toggle Button */}
        <ThemeToggle size="sm" />

        {/* Real-time Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdown(!notifDropdown)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
            title="Notifications"
            data-testid="notification-bell-btn"
          >
            <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                  </p>
                </div>
                {unreadCount > 0 && markAllAsRead && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-medium">No new notifications</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      You're all caught up on civic alerts.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id || n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer flex items-start gap-3 ${
                        !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !n.isRead ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent'
                        }`}
                      ></span>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatDateTime(n.createdAt)}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Persona Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleDropdown(!roleDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="capitalize font-bold text-slate-800 dark:text-slate-200">{role || 'Role'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          {roleDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Switch Role Persona</p>
              </div>
              <button
                onClick={() => handleRoleChange('citizen')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  role === 'citizen' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Citizen</span>
                </span>
                {role === 'citizen' && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
              </button>
              <button
                onClick={() => handleRoleChange('admin')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Municipal Admin</span>
                </span>
                {role === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
              <button
                onClick={() => handleRoleChange('worker')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  role === 'worker' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <HardHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Field Worker</span>
                </span>
                {role === 'worker' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <img
          src={
            user?.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
          }
          alt={user?.name || 'User Avatar'}
          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          title={`${user?.name} (${role})`}
        />
      </div>
    </header>
  );
}
