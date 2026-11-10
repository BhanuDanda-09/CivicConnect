import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-6xl font-black text-slate-200 dark:text-slate-800 block font-mono">404</span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The civic portal page you are looking for doesn't exist or has been relocated within the municipal directory.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="sm" icon={Home}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
