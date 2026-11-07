import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Unauthorized() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have permission to access this administrative portal section. Use the demo role switcher in the navbar to switch between Citizen, Admin, and Worker personas.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

