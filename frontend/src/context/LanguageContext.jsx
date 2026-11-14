// ==============================================================================
// Language Context (LanguageContext.jsx)
// State management for user language preference, translations, and font sizes
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('civicconnect-lang') || 'en';
  });

  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('civicconnect-high-contrast') === 'true';
  });

  const [fontSizeScale, setFontSizeScale] = useState(() => {
    return localStorage.getItem('civicconnect-font-scale') || 'normal';
  });

  useEffect(() => {
    localStorage.setItem('civicconnect-lang', currentLang);
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  useEffect(() => {
    localStorage.setItem('civicconnect-high-contrast', isHighContrast);
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    localStorage.setItem('civicconnect-font-scale', fontSizeScale);
    document.documentElement.classList.remove('text-scale-small', 'text-scale-large', 'text-scale-normal');
    if (fontSizeScale === 'small') {
      document.documentElement.classList.add('text-scale-small');
    } else if (fontSizeScale === 'large') {
      document.documentElement.classList.add('text-scale-large');
    } else {
      document.documentElement.classList.add('text-scale-normal');
    }
  }, [fontSizeScale]);

  const t = (key, fallback = '') => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || fallback || key;
  };

  const toggleHighContrast = () => setIsHighContrast((prev) => !prev);
  const toggleFontSize = () => setFontSizeScale((prev) => (prev === 'normal' ? 'large' : 'normal'));

  const decreaseTextSize = () => {
    setFontSizeScale((prev) => (prev === 'large' ? 'normal' : 'small'));
  };

  const increaseTextSize = () => {
    setFontSizeScale((prev) => (prev === 'small' ? 'normal' : 'large'));
  };

  const resetTextSize = () => {
    setFontSizeScale('normal');
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setCurrentLang,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        isHighContrast,
        toggleHighContrast,
        fontSizeScale,
        toggleFontSize,
        decreaseTextSize,
        increaseTextSize,
        resetTextSize,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

