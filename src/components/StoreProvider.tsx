'use client'

import { createContext, useContext, ReactNode } from 'react'
import { StoreSSRData } from '@/lib/ssr'

interface StoreContextType {
  store: StoreSSRData | null
}

const StoreContext = createContext<StoreContextType>({ store: null })

export function StoreProvider({ 
  children, 
  store 
}: { 
  children: ReactNode
  store: StoreSSRData | null 
}) {
  return (
    <StoreContext.Provider value={{ store }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}