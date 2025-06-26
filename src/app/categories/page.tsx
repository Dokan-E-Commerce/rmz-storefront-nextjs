import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientCategoriesPage from './ClientCategoriesPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = `Categories | ${store?.name || 'Online Store'}`
  const description = store?.description 
    ? `Browse our product categories at ${store.name}. ${store.description}`
    : `Discover our product categories and find exactly what you're looking for at ${store?.name || 'our online store'}.`

  const keywords = [
    'categories',
    'product categories',
    'browse products',
    'shopping categories',
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
      canonical: '/categories',
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

export default function CategoriesPage() {
  return (
    <>
      {/* Structured Data for Categories Listing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Product Categories",
            "description": "Browse our product categories",
            "url": "/categories",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Categories"
            }
          })
        }}
      />
      
      <ClientCategoriesPage />
    </>
  )
}