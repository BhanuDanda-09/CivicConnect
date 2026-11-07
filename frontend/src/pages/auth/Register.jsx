import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { User, Mail, Phone, Lock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!/^\+?[0-9\s-]{10,14}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.address.trim()) errs.address = 'Residential street address is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.terms) {
      errs.terms = 'You must agree to the Terms of Service';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      register(formData);
      setIsSubmitting(false);
      toast.success('Registration successful! Welcome to CivicConnect.');
      navigate('/citizen/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-900">
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
            Register as a Citizen
          </h2>
          <p className="text-xs text-slate-500">
            Create an account to report neighborhood problems and receive real-time repair notifications.
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g., Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Residential Address / Ward <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Lotus Heights, Ward 4 - South Green Park"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>
              {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address}</p>}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                />
                <label htmlFor="terms" className="ml-2 text-xs text-slate-600 leading-relaxed">
                  I agree to the CivicConnect Citizen Charter and understand that false or misleading complaints may be rejected.
                </label>
              </div>
              {errors.terms && <p className="mt-1 text-xs text-rose-500">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={isSubmitting}
              className="w-full"
            >
              Complete Registration (Demo)
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
