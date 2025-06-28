import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getStoreSSRData, generateStoreMetaTags, getCategorySSRData, generateCategoryStructuredData } from '@/lib/ssr'
import ClientCategoryPage from './ClientCategoryPage'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for category page SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const store = await getStoreSSRData()
  
  if (!store) {
    return {
    }
  }

  try {
    // Fetch category data for SEO using new SSR function
    const category = await getCategorySSRData(slug)
    
    if (!category) {
      return {
      }
    }
    
    const categoryTitle = category.name
    const categoryDescription = category.description || `تصفح منتجات ${category.name} في ${store.name}. اكتشف أفضل المنتجات الرقمية والدورات والاشتراكات.`
    
    const metaTags = generateStoreMetaTags(store, `/categories/${slug}`)
    
    return {
      title: categoryTitle,
      description: categoryDescription,
      keywords: [
        categoryTitle,
        'منتجات',
        'تصنيف',
        'تصفح',
        store.name,
        'شراء اونلاين',
        'منتجات رقمية',
        'دورات',
        'اشتراكات',
        'السعودية'
      ].join(', '),
      openGraph: {
        ...metaTags.openGraph,
        images: category.image ? [
          {
            url: category.image.full_link || category.image.url,
            width: 1200,
            height: 630,
            alt: category.image.alt_text || category.name,
          }
        ] : [],
      },
      twitter: {
        ...metaTags.twitter,
      },
      other: {
        ...metaTags.other,
        'category:name': category.name,
        'category:products_count': category.products_count?.toString() || '0',
        'category:type': 'product_category',
      }
    }
  } catch (error) {
    return {
    }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  
  if (!slug) {
    notFound()
  }

  // Fetch category and store data for structured data
  const store = await getStoreSSRData()
  const category = await getCategorySSRData(slug)

  // Category will be loaded client-side if SSR fails, so no need to 404

  // Generate structured data for SEO
  const structuredData = store && category ? generateCategoryStructuredData(category, store) : null

  return (
    <>
      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      <ClientCategoryPage slug={slug} initialCategory={category} />
    </>
  )
}