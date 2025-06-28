'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeProvider as StoreThemeProvider } from '@/components/providers/ThemeProvider';
import AuthInitializer from '@/components/AuthInitializer';
import { initConsoleBranding } from '@/lib/console-branding';

let globalQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return new QueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!globalQueryClient) {
      globalQueryClient = new QueryClient();
    }
    return globalQueryClient;
  }
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  // Initialize console branding on mount
  useEffect(() => {
    initConsoleBranding();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <StoreThemeProvider>
          <AuthInitializer />
          {children}
        </StoreThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}