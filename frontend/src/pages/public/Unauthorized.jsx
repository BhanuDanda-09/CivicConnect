import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Shield, HardHat, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function Unauthorized() {
  const { switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitchAndGo = (role, path) => {
    switchDemoRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border border-rose-100 dark:border-rose-900/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Access Restricted</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          You do not have permission to access this administrative portal section. Use the one-click demo personas below or the switcher in the navigation bar to test authorized features.
        </p>

        {/* Quick Demo Role Switcher Options */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Switch Demo Persona
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSwitchAndGo('admin', '/admin/dashboard')}
              className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Municipal Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchAndGo('worker', '/worker/dashboard')}
              className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <HardHat className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Field Worker</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Home
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => handleSwitchAndGo('citizen', '/citizen/dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>Citizen Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
