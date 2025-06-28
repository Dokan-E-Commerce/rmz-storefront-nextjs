'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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
  initialLanguage?: string;
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
  // Use server language as initial value to prevent hydration mismatch
  const serverLanguage = initialLanguage && SUPPORTED_LOCALES.includes(initialLanguage)
    ? initialLanguage
    : DEFAULT_LOCALE;

  // Initialize with server language, will be updated client-side
  const [locale, setLocaleState] = useState<string>(serverLanguage);
  const [mounted, setMounted] = useState(false);

  const isRTL = locale === 'ar';

  // Client-side initialization after mount
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for saved preference
    try {
      const savedLocale = localStorage.getItem(STORAGE_KEY);
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
        if (savedLocale !== serverLanguage) {
          setLocaleState(savedLocale);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [serverLanguage]);

  // Update document attributes when locale changes
  useEffect(() => {
    if (mounted) {
      updateDocumentAttributes(locale);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [locale, mounted]);

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
    // Return default values if context is not available (during SSR or hydration)
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      isRTL: false
    };
  }
  return context;
}
