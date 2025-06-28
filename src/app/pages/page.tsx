import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientPagesPage from './ClientPagesPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = 'الصفحات'
  const description = `تصفح جميع الصفحات والمحتوى في ${store?.name || 'متجرنا الإلكتروني'}. ابحث عن المعلومات والسياسات والموارد المفيدة.`

  const keywords = [
    'صفحات',
    'معلومات',
    'محتوى',
    'مساعدة',
    'موارد',
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
          alt: `${store.name} Pages`,
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
      canonical: '/pages',
    },
  }
}

export default function PagesPage() {
  return <ClientPagesPage />
}