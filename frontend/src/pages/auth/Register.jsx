import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import {
  INDIAN_STATES_AND_UT,
  INDIAN_DISTRICTS_BY_STATE,
  validateIndianMobile,
  validateIndianPinCode,
  formatFullIndianAddress,
  cleanIndianMobile,
} from '../../utils/indianGeoData';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  Home as HomeIcon,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    houseNumber: '',
    street: '',
    landmark: '',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    pincode: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available districts dynamically updated based on chosen state
  const availableDistricts = useMemo(() => {
    return INDIAN_DISTRICTS_BY_STATE[formData.state] || [];
  }, [formData.state]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const districts = INDIAN_DISTRICTS_BY_STATE[newState] || [];
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || '',
      city: prev.city || districts[0] || '',
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full legal name is required';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Name must be at least 3 characters long';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address format';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!validateIndianMobile(formData.phone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
    }

    if (!formData.street.trim()) {
      errs.street = 'Street or locality name is required';
    }

    if (!formData.city.trim()) {
      errs.city = 'City, town, or village is required';
    }

    if (!formData.pincode.trim()) {
      errs.pincode = '6-digit PIN code is required';
    } else if (!validateIndianPinCode(formData.pincode)) {
      errs.pincode = 'PIN code must be a valid 6-digit Indian postal code (e.g. 500001)';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.terms) {
      errs.terms = 'You must agree to the CivicConnect citizen charter';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve the errors highlighted in the form.');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Standardize mobile number and create full structured address
    const cleanPhone = cleanIndianMobile(formData.phone);
    const fullFormattedAddress = formatFullIndianAddress({
      houseNumber: formData.houseNumber,
      street: formData.street,
      landmark: formData.landmark,
      city: formData.city,
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode,
    });

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: `+91${cleanPhone}`,
      address: fullFormattedAddress,
      houseNumber: formData.houseNumber.trim(),
      street: formData.street.trim(),
      landmark: formData.landmark.trim(),
      city: formData.city.trim(),
      district: formData.district,
      state: formData.state,
      pincode: formData.pincode.trim(),
      password: formData.password,
      role: 'citizen', // Enforce citizen public signup policy
    };

    try {
      const res = await register(payload);
      if (res.success) {
        toast.success('Registration successful! Welcome to CivicConnect.');
        navigate('/citizen/dashboard');
      } else {
        const errorMsg = res.error || 'Registration failed. Please try again.';
        setErrors({ form: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed.';
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-900 dark:text-white group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center text-sky-400 font-bold shadow-md">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-2xl font-black">
              Civic<span className="text-sky-600 dark:text-sky-400">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Register as a Citizen
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create an official resident profile to report civic hazards, track repair timelines, and verify municipal remediation with photographic proof.
          </p>
        </div>

        {/* Role Security Advisory Banner */}
        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 rounded-2xl flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
          <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Role Security Policy:</strong> Public registration is strictly for <strong>Citizen accounts</strong>. Municipal Overseers and Field Workers are provisioned via the Municipal Corporation Administration.
          </p>
        </div>

        {/* Form Error Banner */}
        {errors.form && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start space-x-2 text-rose-800 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Main Registration Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Personal Identification */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                1. Citizen Identity & Contact
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g., Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.name ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                    }`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.email ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.phone ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Indian Structured Address */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                2. Indian Residential Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    House / Door / Flat No.
                  </label>
                  <div className="relative">
                    <HomeIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, B-Block"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Street / Locality <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 4th Main Road, Gandhi Nagar"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.street ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {errors.street && <p className="mt-1 text-xs text-rose-500">{errors.street}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Water Tank"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    State / UT <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={handleStateChange}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    {INDIAN_STATES_AND_UT.map((st) => (
                      <option key={st} value={st} className="dark:bg-slate-900">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    {availableDistricts.map((dst) => (
                      <option key={dst} value={dst} className="dark:bg-slate-900">
                        {dst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    City / Town / Village <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.city ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Postal PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 500001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all font-mono ${
                      errors.pincode ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                    }`}
                  />
                  {errors.pincode && <p className="mt-1 text-xs text-rose-500">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Security & Passwords */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                3. Security & Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.password ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-2">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-sky-600 border-slate-300 dark:border-slate-700 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed cursor-pointer">
                  I agree to the CivicConnect Citizen Service Charter and confirm that all submitted residential details and complaints represent authentic community issues.
                </label>
              </div>
              {errors.terms && <p className="mt-1 text-xs text-rose-500">{errors.terms}</p>}
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
