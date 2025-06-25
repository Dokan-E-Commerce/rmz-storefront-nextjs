import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getStoreSSRData, generateStoreMetaTags, getProductSSRData, generateProductStructuredData } from '@/lib/ssr'
import ClientProductPage from './ClientProductPage'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for product page SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const store = await getStoreSSRData()
  
  if (!store) {
    return {
    }
  }

  try {
    // Fetch product data for SEO using new SSR function
    const product = await getProductSSRData(slug)
    
    if (!product) {
      return {
      }
    }
    
    const productTitle = product.marketing_title || product.name
    const productDescription = product.short_description || 
      (product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : `${productTitle} - Available at ${store.name}`)
    
    const metaTags = generateStoreMetaTags(store, `/products/${slug}`)
    
    return {
      keywords: [
        productTitle,
        ...product.categories?.map((cat: any) => cat.name) || [],
        product.type,
        store.name,
        'buy online',
        'digital product'
      ].join(', '),
      openGraph: {
        ...metaTags.openGraph,
        images: product.image?.full_link || product.image?.url ? [
          {
            url: product.image?.full_link || product.image?.url || '',
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ] : metaTags.openGraph.images,
      },
      twitter: {
        ...metaTags.twitter,
      },
      other: {
        ...metaTags.other,
        'product:price:amount': product.price?.actual || product.price?.original,
        'product:price:currency': store.currency || 'SAR',
        'product:availability': product.stock?.unlimited || product.stock?.available > 0 ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:brand': store.name,
        'product:retailer_item_id': product.id,
      }
    }
  } catch (error) {
    return {
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  if (!slug) {
    notFound()
  }

  // Fetch product and store data for structured data
  const store = await getStoreSSRData()
  const product = await getProductSSRData(slug)

  // Generate structured data for SEO
  const structuredData = store && product ? generateProductStructuredData(product, store) : null

  return (
    <>
      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      <ClientProductPage slug={slug} initialProduct={product} />
    </>
  )
}