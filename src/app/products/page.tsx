import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientProductsPage from './ClientProductsPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = `All Products | ${store?.name || 'Online Store'}`
  const description = store?.description 
    ? `Browse our complete collection of products at ${store.name}. ${store.description}`
    : `Discover amazing products and deals. Shop digital products, courses, subscriptions and more at ${store?.name || 'our online store'}.`

  const keywords = [
    'products',
    'online shopping',
    'digital products',
    'e-commerce',
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