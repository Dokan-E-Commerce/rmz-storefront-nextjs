'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeProvider as StoreThemeProvider } from '@/components/providers/ThemeProvider';
import AuthInitializer from '@/components/AuthInitializer';
import { initConsoleBranding } from '@/lib/console-branding';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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
