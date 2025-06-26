/**
 * Production optimizations and utilities
 */
import React from 'react';

// Environment check utilities
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Performance monitoring
export const performanceMonitor = {
  startTiming: (label: string) => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-start`);
    }
  },
  
  endTiming: (label: string) => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }
  },
  
  clearTimings: () => {
    if (isDevelopment && typeof window !== 'undefined' && window.performance) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
};

// Lazy loading utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) => {
  return React.lazy(componentImport);
};

// Image optimization
export const getOptimizedImageProps = (src: string, alt: string = '') => ({
  src,
  alt,
  loading: 'lazy' as const,
  quality: isProduction ? 85 : 95,
  sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  style: { objectFit: 'cover' as const }
});

// API request optimization
export const createOptimizedFetch = () => {
  const cache = new Map();
  
  return async (url: string, options: RequestInit = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, data);
      return data;
    }
    
    throw new Error(`HTTP error! status: ${response.status}`);
  };
};

// Bundle size optimization
export const removeUnusedImports = () => {
  // This function helps identify unused imports in development
  if (isDevelopment) {
    console.log('🔍 Development mode: Check for unused imports');
  }
};

// Memory management
export const cleanupMemory = () => {
  if (typeof window !== 'undefined' && 'gc' in window) {
    // Request garbage collection if available
    (window as any).gc();
  }
};