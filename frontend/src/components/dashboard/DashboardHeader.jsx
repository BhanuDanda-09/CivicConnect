import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, Shield, HardHat, ChevronDown, Check } from 'lucide-react';

export default function DashboardHeader({ onMenuClick, title, subtitle, action }) {
  const { user, role, switchDemoRole } = useAuth();
  const [roleDropdown, setRoleDropdown] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    switchDemoRole(newRole);
    setRoleDropdown(false);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'worker') navigate('/worker/dashboard');
    else navigate('/citizen/dashboard');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Titles */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Right: Actions, Persona Switcher & Profile */}
      <div className="flex items-center space-x-3">
        {action && <div>{action}</div>}

        {/* Demo Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdown(!roleDropdown)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
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
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
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
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
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
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
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
          src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
          alt={user?.name || "User Avatar"}
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
          title={`${user?.name} (${role})`}
        />
      </div>
    </header>
  );
}

