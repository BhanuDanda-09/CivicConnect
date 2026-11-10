// ==============================================================================
// Accessible Theme Toggle Switch (ThemeToggle.jsx)
// ==============================================================================

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
        isSmall ? 'p-1.5' : 'p-2'
      } ${
        isDark
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 shadow-sm'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 shadow-xs'
      } ${className}`}
    >
      <span className="sr-only">Toggle dark mode</span>
      {isDark ? (
        <Sun className={`${isSmall ? 'w-4 h-4' : 'w-4.5 h-4.5'} transition-transform duration-300 rotate-0 hover:rotate-45`} />
      ) : (
        <Moon className={`${isSmall ? 'w-4 h-4' : 'w-4.5 h-4.5'} transition-transform duration-300 -rotate-12 hover:rotate-0`} />
      )}
    </button>
  );
}

