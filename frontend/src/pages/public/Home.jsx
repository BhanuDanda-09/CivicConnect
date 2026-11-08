import React from 'react';
import { Link } from 'react-router-dom';
import { COMPLAINT_CATEGORIES, APP_NAME, APP_TAGLINE } from '../../utils/constants';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Camera,
  Activity,
  Users,
  Building2,
  Smartphone,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Complaints Resolved', value: '4,280+', change: '+12% this month', color: 'emerald' },
    { label: 'Active Grievances', value: '142', change: 'Current on-site tasks', color: 'sky' },
    { label: 'Avg Resolution Time', value: '26 hrs', change: 'Across all wards', color: 'indigo' },
    { label: 'Citizen Satisfaction', value: '94.8%', change: 'Based on 3,100+ reviews', color: 'amber' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Report an Issue',
      desc: 'Capture a photo of the road hazard, water leak, or garbage accumulation. Our GPS coordinates pin the location instantly.',
      icon: Camera,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      num: '02',
      title: 'Authorities Review',
      desc: 'Municipal desk verifies the complaint authenticity, assigns priority level, and routes it to the specific department crew.',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      num: '03',
      title: 'Worker Resolves',
      desc: 'Dispatched field workers arrive on site, carry out necessary repairs or cleanup, and upload post-work photographic proof.',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      num: '04',
      title: 'Citizen Gives Feedback',
      desc: 'The citizen receives resolution notification with before/after photos and rates the service quality to ensure accountability.',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
  ];

  const benefits = [
    {
      title: '100% Transparent Tracking',
      desc: 'Monitor real-time progress from submission to resolution with automated status timestamps and assigned crew details.',
      icon: Activity,
    },
    {
      title: 'Geotagged Accuracy',
      desc: 'Interactive OpenStreetMap integration prevents duplicate complaints and enables workers to pinpoint issues directly.',
      icon: MapPin,
    },
    {
      title: 'DevOps Automated Pipeline',
      desc: 'Built with enterprise-grade CI/CD automation, Docker containerization, Kubernetes scaling, and Prometheus monitoring.',
      icon: Building2,
    },
    {
      title: 'Inclusive & Mobile First',
      desc: 'Optimized for mobile browsers and tablets so field workers and citizens on the road can easily file and manage reports.',
      icon: Smartphone,
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sky-400 text-xs font-semibold backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Official Municipal Civic Portal</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Smart City Initiative</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Together, Let's Build a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300">
                  Better Community.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Report damaged roads, garbage dumps, water pipe leaks, or broken streetlights directly to your local municipality. Track live progress and verify solutions with photo evidence.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/citizen/submit-complaint"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/track"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/80 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Track Complaint</span>
                </Link>
              </div>

              {/* Role Quick Access Navigation Bar */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
                <Link
                  to="/citizen/dashboard"
                  className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                    <span>Citizen Portal</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Submit grievances with GPS & photo evidence
                  </p>
                </Link>

                <Link
                  to="/worker/dashboard"
                  className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-teal-400 mb-1">
                    <span>Field Worker</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    On-site GPS tasks, repair uploads & resolution
                  </p>
                </Link>

                <Link
                  to="/admin/dashboard"
                  className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-400 mb-1">
                    <span>Municipal Admin</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    Verification, crew assignment & ward analytics
                  </p>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-md p-4">
                  <div className="relative rounded-2xl overflow-hidden h-72 sm:h-84 bg-slate-900 group">
                    <img
                      src="https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80"
                      alt="Civic Infrastructure Repair Work"
                      onError={(e) => {
                        // Reliable SVG fallback if Unsplash image network is restricted
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300';
                        fallbackDiv.innerHTML = '<div class="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3"><svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div><p class="font-bold text-sm text-white">Smart Civic Infrastructure Dispatch</p><p class="text-xs text-slate-400 mt-1">Real-time municipal grievance resolution unit</p>';
                        parent.appendChild(fallbackDiv);
                      }}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    {/* Live Municipal Dispatch Floating Card */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-left shadow-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                          <span>Live Municipal Dispatch</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider uppercase border border-emerald-500/30">
                          IN PROGRESS
                        </span>
                      </div>
                      <p className="text-xs text-white font-bold truncate">
                        Road asphalt resurfacing at Metro Pillar 42, Ward 1
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-800">
                        <span>Crew: Roads & Works Unit #3</span>
                        <span className="text-cyan-300 font-mono font-medium">SLA: 4h remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-lg shadow-slate-900/5 hover:-translate-y-1 transition-all"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{s.value}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{s.change}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-3 italic">
          * Figures shown are demonstration simulation metrics for academic presentation.
        </p>
      </section>

      {/* Problem Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Issue Categories
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            What Can You Report on CivicConnect?
          </h2>
          <p className="text-sm text-slate-600">
            Select an infrastructure category to quickly report a problem in your street or neighborhood.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-xs">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  24h-48h SLA
                </span>
                <Link
                  to={`/citizen/submit-complaint?category=${cat.id}`}
                  className="inline-flex items-center text-xs font-bold text-sky-600 hover:text-sky-700 group-hover:translate-x-1 transition-all"
                >
                  <span>Report</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Transparent Lifecycle
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              How CivicConnect Works
            </h2>
            <p className="text-sm text-slate-600">
              A 4-step seamless process connecting citizens directly to field engineers and administrative overseers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative"
                >
                  <span className="text-3xl font-black text-slate-200 absolute top-4 right-4">
                    {st.num}
                  </span>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${st.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Benefits & DevOps Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            Key Advantages
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Designed for Reliability, Speed & Trust
          </h2>
          <p className="text-sm text-slate-600">
            Modern civic-tech engineering combining user-friendly frontend design with cloud-native DevOps reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="flex items-start space-x-4 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
            Spot a problem in your street? Report it right now.
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of active citizens making our city cleaner, safer, and better for everyone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/citizen/submit-complaint"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              Report an Issue
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              Learn More About CivicConnect
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

