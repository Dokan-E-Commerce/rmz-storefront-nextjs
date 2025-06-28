'use client';

import dynamic from 'next/dynamic';
import { LanguageProvider } from './LanguageProvider';

// Dynamic import with no SSR to prevent hydration issues
const ClientOnlyLanguageProvider = dynamic(
  () => Promise.resolve(LanguageProvider),
  { 
    ssr: false,
    loading: () => null
  }
);

interface ClientLanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: string;
}

export default function ClientLanguageProvider({ children, initialLanguage }: ClientLanguageProviderProps) {
  return (
    <ClientOnlyLanguageProvider initialLanguage={initialLanguage}>
      {children}
    </ClientOnlyLanguageProvider>
  );
}