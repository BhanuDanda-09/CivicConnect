import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject line is required';
    if (!formData.message.trim()) {
      errs.message = 'Message cannot be empty';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Phase 2: Frontend simulation
    setSubmitted(true);
    toast.success('Your message has been received! (Demo Mode)');
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Get in Touch
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Contact Municipal Support
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Have an inquiry, feedback regarding civic services, or need assistance navigating the CivicConnect portal? Reach out to our helpdesk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white">Municipal Headquarters</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              For emergency reports or immediate civic hazards, dial the 24x7 municipal toll-free number or visit your local ward office.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3 text-slate-300">
                <Phone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Toll-Free Civic Helpline</p>
                  <p>1913 / 1800-233-0000 (Toll-Free, 24x7)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-300">
                <Mail className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Address</p>
                  <p>support@civicconnect.org</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-300">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Central Corporation Office</p>
                  <p>Civic Administrative Complex, Shivaji Road, Ward 1</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-300">
                <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Public Desk Hours</p>
                  <p>Monday - Friday: 9:00 AM – 5:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Phase 2 Notice</p>
              <p className="text-[11px] text-amber-800">
                This contact form runs in frontend demonstration mode. Messages will be recorded into the Express database in Phase 3.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Thank You for Reaching Out!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your message has been logged in demonstration mode. In a production environment, our municipal grievance officer would reply within 24 business hours.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
              >
                Send Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-bold text-slate-900">Send an Inquiry or Feedback</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Query regarding Ward 4 sanitation schedule"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.subject && <p className="mt-1 text-xs text-rose-500">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your inquiry or feedback clearly..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                {errors.message && <p className="mt-1 text-xs text-rose-500">{errors.message}</p>}
              </div>

              <Button type="submit" variant="primary" size="md" icon={Send} className="w-full">
                Submit Inquiry (Demo)
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

