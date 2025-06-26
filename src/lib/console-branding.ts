/**
 * Console branding and development utilities
 */

export const initConsoleBranding = () => {
  if (typeof window === 'undefined') return;

  try {
    // Custom console styling
    const styles = {
      title: 'color: #3B82F6; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px rgba(59, 130, 246, 0.3);',
      subtitle: 'color: #6B7280; font-size: 12px; font-weight: normal;',
      link: 'color: #3B82F6; font-size: 12px; text-decoration: underline;'
    };

    // Clear console in production
    if (process.env.NODE_ENV === 'production') {
      console.clear();
    }

    // Brand message
    console.log('%cRMZ.GG Store Front Theme - Basic', styles.title);
    console.log('%cMade by the greatest dev team @ dokan.sa', styles.subtitle);
    console.log('%chttps://dokan.sa', styles.link);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('%c🚀 Development Mode Active', 'color: #F59E0B; font-size: 12px;');
    }
  } catch (error) {
    // Silent fail for console branding
  }
};

// Utility to conditionally log in development only
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

// Utility to conditionally warn in development only
export const devWarn = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(...args);
  }
};

// Utility to conditionally error (always show errors)
export const prodError = (...args: any[]) => {
  console.error(...args);
};