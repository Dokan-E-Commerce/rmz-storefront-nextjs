'use client';

import React from 'react';
import { useStore } from '@/components/StoreProvider';
import MaintenanceMode from '@/components/MaintenanceMode';

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const { store } = useStore();

  // Check if store is in maintenance mode
  if (store?.is_maintenance) {
    return (
      <MaintenanceMode 
        reason={store.maintenance_message} 
        estimatedTime={undefined}
      />
    );
  }

  return <>{children}</>;
}