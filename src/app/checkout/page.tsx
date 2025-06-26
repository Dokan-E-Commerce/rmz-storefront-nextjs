import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientCheckoutPage from './ClientCheckoutPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  return {
    title: `Checkout | ${store?.name || 'Online Store'}`,
    description: 'Complete your purchase',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    alternates: {
      canonical: '/checkout',
    },
  }
}

export default function CheckoutPage() {
  return <ClientCheckoutPage />
}