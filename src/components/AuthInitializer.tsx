'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

export default function AuthInitializer() {
  const { initAuth } = useAuth();

  useEffect(() => {
    // Initialize auth when the component mounts
    initAuth();
  }, [initAuth]);

  // This component doesn't render anything
  return null;
}
