import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please provide a valid registered email');
      return;
    }
    setSent(true);
    toast.success('Password reset instructions recorded.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-xs text-slate-500">
            Enter the email associated with your CivicConnect profile to initiate a password reset.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Request Recorded</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A password reset request for <strong>{email}</strong> has been logged.
              </p>
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-left flex items-start space-x-2 text-[11px] text-sky-800">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Phase Note:</strong> Automated email delivery with one-time security tokens will be integrated in a future notification service phase.
                </span>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700 pt-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Default demo/seed accounts: admin@civicconnect.org, worker@civicconnect.org, citizen@civicconnect.org</span>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Send Reset Instructions
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
