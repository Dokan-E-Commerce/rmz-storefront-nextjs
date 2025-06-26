import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientReviewsPage from './ClientReviewsPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = `Customer Reviews | ${store?.name || 'Online Store'}`
  const description = `Read genuine customer reviews and ratings for products at ${store?.name || 'our online store'}. See what our customers say about their shopping experience.`

  const keywords = [
    'customer reviews',
    'product reviews',
    'ratings',
    'testimonials',
    'customer feedback',
    store?.name,
    store?.seo?.keywords
  ].filter(Boolean).join(', ')

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: store?.name,
      images: store?.logo && typeof store.logo === 'object' ? [
        {
          url: (store.logo as any).full_link || (store.logo as any).url || store.logo,
          width: 1200,
          height: 630,
          alt: `${store.name} Reviews`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: '/reviews',
    },
  }
}

export default function ReviewsPage() {
  return <ClientReviewsPage />
}