import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientCartPage from './ClientCartPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  return {
    title: 'سلة التسوق',
    description: 'راجع منتجات سلة التسوق قبل إتمام الطلب',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    alternates: {
      canonical: '/cart',
    },
  }
}

export default function CartPage() {
  return <ClientCartPage />
}