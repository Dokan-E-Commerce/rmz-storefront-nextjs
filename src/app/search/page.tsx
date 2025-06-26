import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import ClientSearchPage from './ClientSearchPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData()
  
  const title = `Search Products | ${store?.name || 'Online Store'}`
  const description = `Search for products at ${store?.name || 'our online store'}. Find exactly what you're looking for with our advanced search and filtering options.`

  const keywords = [
    'search',
    'find products',
    'product search',
    'search results',
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
      canonical: '/search',
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

export default function SearchPage() {
  return (
    <>
      {/* Structured Data for Search Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "/search",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      
      <ClientSearchPage />
    </>
  )
}