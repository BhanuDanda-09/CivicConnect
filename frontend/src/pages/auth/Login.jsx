import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { Mail, Lock, Eye, EyeOff, Shield, User, HardHat, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('sessionExpired') === 'true';

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

  const handleLoginSuccess = (user, isDemo = false) => {
    if (isDemo) {
      toast.success(`Welcome back, ${user.name}! (Offline Demo Mode)`);
    } else {
      toast.success(`Welcome back, ${user.name}!`);
    }

    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'worker') {
      navigate('/worker/dashboard');
    } else {
      navigate('/citizen/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        handleLoginSuccess(res.user, res.isDemoFallback);
      } else {
        const errorMsg = res.error || 'Invalid email or password';
        setErrors({ form: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    let email = 'citizen@civicconnect.org';
    let password = 'Citizen@12345';

    if (role === 'admin') {
      email = 'admin@civicconnect.org';
      password = 'Admin@12345';
    } else if (role === 'worker') {
      email = 'worker@civicconnect.org';
      password = 'Worker@12345';
    }

    setFormData({ email, password, rememberMe: true });
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await login(email, password, role);
      if (res.success) {
        handleLoginSuccess(res.user, res.isDemoFallback);
      } else {
        setErrors({ form: res.error || 'Authentication failed' });
        toast.error(res.error || 'Authentication failed');
      }
    } catch (err) {
      toast.error('Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
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
            Access your civic complaint dashboard or manage city infrastructure repairs.
          </p>
        </div>

        {/* Session Expired Notice */}
        {sessionExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Your session has expired. Please log in again to continue.</span>
          </div>
        )}

        {/* Form-level Error Message */}
        {errors.form && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Quick Demo Access Bar */}
        <div className="bg-white rounded-2xl border border-sky-200/80 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              One-Click Seeded Personas:
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">
              JWT / RBAC Ready
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemoLogin('citizen')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <User className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Citizen</span>
              <span className="text-[9px] text-slate-400 font-mono">Citizen@12345</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Admin</span>
              <span className="text-[9px] text-slate-400 font-mono">Admin@12345</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemoLogin('worker')}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-center group cursor-pointer disabled:opacity-50"
            >
              <HardHat className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Worker</span>
              <span className="text-[9px] text-slate-400 font-mono">Worker@12345</span>
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
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
              Register as Citizen
            </Link>
          </div>
        </div>

        {/* Security / Architecture Notice */}
        <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Protected by bcrypt hashing & JWT token-based RBAC verification</span>
        </div>
      </div>
    </div>
  );
}
