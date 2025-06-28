import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientReviewsPage from './ClientReviewsPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = 'آراء العملاء'
  const description = `اقرأ آراء العملاء الحقيقية وتقييمات المنتجات في ${store?.name || 'متجرنا الإلكتروني'}. اطلع على ما يقوله عملاؤنا حول تجربة التسوق.`

  const keywords = [
    'آراء العملاء',
    'تقييمات المنتجات',
    'تقييمات',
    'شهادات العملاء',
    'تعليقات العملاء',
    'متجر إلكتروني',
    'السعودية',
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