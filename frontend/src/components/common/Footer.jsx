import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-bold shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Civic<span className="text-sky-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {APP_TAGLINE} A transparent, real-time civic grievance portal connecting citizens, municipal engineers, and ground crews for swift problem resolution.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Municipal Portal Online</span>
              </span>
              <span>•</span>
              <span>Ward Services v1.0</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About the Project
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/citizen/submit-complaint" className="hover:text-white transition-colors">
                  File a Complaint
                </Link>
              </li>
              <li>
                <Link to="/citizen/complaints" className="hover:text-white transition-colors">
                  Track Resolution
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Problem Types</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Road Potholes & Damage</li>
              <li>Solid Waste & Garbage</li>
              <li>Water Mains & Leakages</li>
              <li>Sewage & Drainage Backups</li>
              <li>Non-Functional Streetlights</li>
              <li>Public Restroom Sanitation</li>
            </ul>
          </div>

          {/* Emergency Municipal Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Municipal Helplines</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Civic Helpline: <strong>1913</strong> (24x7)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@civicconnect.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>City Municipal Corporation HQ</span>
              </li>
              <li className="flex items-center space-x-2 text-amber-400 pt-1">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Emergency Control: 112</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {APP_NAME}. Academic & Civic Demonstration Project.</p>
          <div className="flex items-center space-x-6">
            <span className="text-slate-400">Designed with React 18 & Tailwind CSS</span>
            <span>•</span>
            <span className="text-slate-400">DevOps & Cloud Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

