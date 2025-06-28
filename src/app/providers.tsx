'use client';

import dynamic from 'next/dynamic';

// Dynamic import with no SSR to prevent hydration issues
const ClientProviders = dynamic(
  () => import('@/components/ClientProviders').then(mod => ({ default: mod.ClientProviders })),
  { 
    ssr: false,
    loading: () => null
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}
