import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { Mail, Lock, Eye, EyeOff, Shield, User, HardHat, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login(formData.email, formData.password);
      setIsSubmitting(false);
      toast.success(`Welcome back, ${res.user.name}! (Demo Mode)`);

      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'worker') navigate('/worker/dashboard');
      else navigate('/citizen/dashboard');
    }, 400);
  };

  const handleQuickDemoLogin = (role) => {
    let email = 'citizen@civicconnect.org';
    if (role === 'admin') email = 'admin@civicconnect.org';
    if (role === 'worker') email = 'worker@civicconnect.org';

    const res = login(email, 'demo1234', role);
    toast.success(`Logged in as Demo ${res.user.role.toUpperCase()}!`);

    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'worker') navigate('/worker/dashboard');
    else navigate('/citizen/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-900 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-sky-400 font-bold shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-2xl font-black">
              Civic<span className="text-sky-600">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500">
            Access your personalized municipal dashboard or register a new account.
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-white rounded-2xl border border-sky-200/80 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              One-Click Demo Personas:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Phase 2 Demo</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('citizen')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-center group cursor-pointer"
            >
              <User className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Citizen</span>
              <span className="text-[9px] text-slate-400">Rahul S.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-center group cursor-pointer"
            >
              <Shield className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Admin</span>
              <span className="text-[9px] text-slate-400">Priya D.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('worker')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-center group cursor-pointer"
            >
              <HardHat className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Worker</span>
              <span className="text-[9px] text-slate-400">Ramesh P.</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-slate-600">
                Keep me signed in on this device
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full"
            >
              Sign In (Demo)
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
              Register as Citizen
            </Link>
          </div>
        </div>

        {/* Security / Phase Notice */}
        <p className="text-center text-[11px] text-slate-400">
          Phase 2 Notice: Real JWT and bcrypt verification will be connected in Phase 4.
        </p>
      </div>
    </div>
  );
}
