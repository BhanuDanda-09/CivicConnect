import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  Users,
  HardHat,
  BarChart3,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Manage Complaints', path: '/admin/complaints', icon: ClipboardList },
        { label: 'Manage Workers', path: '/admin/workers', icon: HardHat },
        { label: 'Manage Users', path: '/admin/users', icon: Users },
        { label: 'Civic Analytics', path: '/admin/analytics', icon: BarChart3 },
      ];
    }
    if (role === 'worker') {
      return [
        { label: 'Worker Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
        { label: 'Assigned Tasks', path: '/worker/tasks', icon: ClipboardList },
      ];
    }
    // Default to Citizen
    return [
      { label: 'Citizen Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard },
      { label: 'Submit Complaint', path: '/citizen/submit-complaint', icon: FilePlus },
      { label: 'My Complaints', path: '/citizen/complaints', icon: ClipboardList },
      { label: 'Give Feedback', path: '/citizen/feedback', icon: MessageSquare },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    if (role === 'admin') {
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-800">Admin</span>;
    }
    if (role === 'worker') {
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">Field Worker</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800">Citizen</span>;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Mobile Close */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Civic<span className="text-sky-400">Connect</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={user?.name || "User"}
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Demo User'}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                {getRoleBadge()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {role ? `${role.toUpperCase()} MENU` : 'MAIN MENU'}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Home Portal</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
