'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred-language';
const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ar'];

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: string; // Add initial language prop from server
}

// Function to update document attributes immediately
function updateDocumentAttributes(locale: string) {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.body.className = document.body.className.replace(/(font-inter|font-arabic)/g, '');
  document.body.classList.add(locale === 'ar' ? 'font-arabic' : 'font-inter');
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  // Start with server-provided language or default to prevent hydration mismatch
  const serverLanguage = initialLanguage && SUPPORTED_LOCALES.includes(initialLanguage)
    ? initialLanguage
    : DEFAULT_LOCALE;

  const [locale, setLocaleState] = useState<string>(serverLanguage);
  const [isHydrated, setIsHydrated] = useState(false);

  const isRTL = locale === 'ar';

    // Initialize client-side locale after hydration
  useEffect(() => {
    let targetLocale = serverLanguage;

    // Check localStorage for user preference only after hydration
    const savedLocale = localStorage.getItem(STORAGE_KEY);
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      targetLocale = savedLocale;
    }

    // Only update if different from current state to prevent unnecessary re-renders
    if (targetLocale !== locale) {
      setLocaleState(targetLocale);
    }

    updateDocumentAttributes(targetLocale);
    setIsHydrated(true);
  }, [serverLanguage, locale]);

  // Update document attributes when locale changes
  useEffect(() => {
    if (isHydrated) {
      updateDocumentAttributes(locale);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale, isHydrated]);

  const setLocale = (newLocale: string) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    setLocaleState(newLocale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isRTL }}>
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
