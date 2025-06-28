import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientProductsPage from './ClientProductsPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = 'جميع المنتجات'
  const description = store?.description 
    ? `تصفح مجموعتنا الكاملة من المنتجات في ${store.name}. ${store.description}`
    : `اكتشف منتجات وعروض مذهلة. تسوق المنتجات الرقمية والدورات والاشتراكات والمزيد في ${store?.name || 'متجرنا الإلكتروني'}.`

  const keywords = [
    'منتجات',
    'تسوق اونلاين',
    'منتجات رقمية',
    'تجارة إلكترونية',
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
      images: store?.logo ? [
        {
          url: store.logo,
          width: 400,
          height: 400,
          alt: `${store.name} logo`,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: store?.logo ? [store.logo] : undefined,
    },
    alternates: {
      canonical: '/products',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function ProductsPage() {
  return (
    <>
      {/* Structured Data for Product Listing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Products",
            "description": "Browse our complete collection of products",
            "url": "/products",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Products"
            }
          })
        }}
      />
      
      <ClientProductsPage />
    </>
  )
}