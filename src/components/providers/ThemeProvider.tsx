'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useStore } from '@/components/StoreProvider';

interface ThemeContextType {
  store: any;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Helper function to convert hex to HSL for primary color only
function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { store } = useStore();
  const isLoading = false; // Store data is available from SSR

  useEffect(() => {
    if (store) {
      // Get store color from theme.color field (matching API structure)
      const primaryColor = (store as any).theme?.color || '#3B82F6';
      
      const primaryHsl = hexToHsl(primaryColor);
      
      // Apply store color to CSS custom properties
      const root = document.documentElement;
      
      // Update primary color for buttons and interactive elements
      root.style.setProperty('--primary', primaryHsl);
      
      // Store raw color for special cases (badges, etc.)
      root.style.setProperty('--store-primary-hex', primaryColor);
      
    }
  }, [store]);

  // Also set up RTL support if enabled
  useEffect(() => {
    if ((store as any)?.theme?.enable_rtl) {
      document.dir = 'rtl';
      document.documentElement.classList.add('rtl');
    } else {
      document.dir = 'ltr';
      document.documentElement.classList.remove('rtl');
    }
  }, [(store as any)?.theme?.enable_rtl]);

  return (
    <ThemeContext.Provider value={{ store, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}