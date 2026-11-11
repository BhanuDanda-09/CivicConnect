// ==============================================================================
// Accessibility & Language Switcher Toolbar (AccessibilityToolbar.jsx)
// Provides instant high-contrast toggle, font sizing, and Indian language selection
// ==============================================================================

import React from 'react';
import { Globe, Eye, Type } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AccessibilityToolbar() {
  const {
    currentLang,
    setCurrentLang,
    supportedLanguages,
    isHighContrast,
    toggleHighContrast,
    fontSizeScale,
    toggleFontSize,
  } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
      {/* 1. Indian Language Selector */}
      <div className="relative inline-flex items-center">
        <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 absolute left-2 pointer-events-none" />
        <select
          value={currentLang}
          onChange={(e) => setCurrentLang(e.target.value)}
          aria-label="Select Portal Language"
          className="pl-7 pr-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code} className="dark:bg-slate-900">
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Font Size Scaling Button */}
      <button
        type="button"
        onClick={toggleFontSize}
        aria-label="Toggle Font Scaling"
        title="Toggle Font Size (A / A+)"
        className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-0.5 ${
          fontSizeScale === 'large'
            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
        }`}
      >
        <Type className="w-3 h-3" />
        <span>{fontSizeScale === 'large' ? 'A+' : 'A'}</span>
      </button>

      {/* 3. High Contrast Mode Toggle */}
      <button
        type="button"
        onClick={toggleHighContrast}
        aria-label="Toggle High Contrast Display"
        title="High Contrast Mode for Visual Accessibility"
        className={`p-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
          isHighContrast
            ? 'bg-amber-400 text-black border-amber-500 shadow-xs'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

