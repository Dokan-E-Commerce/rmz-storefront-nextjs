import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientWishlistPage from './ClientWishlistPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  return {
    title: `Wishlist | ${store?.name || 'Online Store'}`,
    description: 'Your saved items and favorites',
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