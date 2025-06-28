import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientWishlistPage from './ClientWishlistPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  return {
    title: 'قائمة الأمنيات',
    description: 'العناصر المحفوظة والمفضلة لديك',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    alternates: {
      canonical: '/wishlist',
    },
  }
}

export default function WishlistPage() {
  return <ClientWishlistPage />
}