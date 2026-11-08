// ==============================================================================
// Dashboard Header Component (DashboardHeader.jsx)
// Phase 7 - Real-Time Notification Bell, Role Switcher & Profile
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { useNavigate, Link } from 'react-router-dom';
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Actions, Notifications, Persona Switcher & Profile */}
      <div className="flex items-center space-x-3">
        {action && <div>{action}</div>}

        {/* Real-time Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdown(!notifDropdown)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            title="Notifications"
            data-testid="notification-bell-btn"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full border-2 border-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Notifications</h3>
                  <p className="text-[10px] text-slate-400">
                    {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                  </p>
                </div>
                {unreadCount > 0 && markAllAsRead && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">No new notifications</p>
                    <p className="text-[10px] text-slate-400">
                      You're all caught up on civic alerts.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id || n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !n.isRead ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !n.isRead ? 'bg-indigo-600' : 'bg-transparent'
                        }`}
                      ></span>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{formatDateTime(n.createdAt)}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
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
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="capitalize font-bold text-slate-800">{role || 'Role'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Switch Role Persona</p>
              </div>
              <button
                onClick={() => handleRoleChange('citizen')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  role === 'citizen' ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>Citizen</span>
                </span>
                {role === 'citizen' && <Check className="w-3.5 h-3.5 text-sky-600" />}
              </button>
              <button
                onClick={() => handleRoleChange('admin')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  role === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Municipal Admin</span>
                </span>
                {role === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
              <button
                onClick={() => handleRoleChange('worker')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                  role === 'worker' ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  <span>Field Worker</span>
                </span>
                {role === 'worker' && <Check className="w-3.5 h-3.5 text-amber-600" />}
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
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
          title={`${user?.name} (${role})`}
        />
      </div>
    </header>
  );
}
