'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeProvider as StoreThemeProvider } from '@/components/providers/ThemeProvider';
import AuthInitializer from '@/components/AuthInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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
