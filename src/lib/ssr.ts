import { cache } from 'react'
import { headers } from 'next/headers'
import { createStorefrontSDK, type StorefrontConfig } from 'rmz-storefront-sdk'

export interface StoreSSRData {
  id: number
  name: string
  description?: string
  short_description?: string
  logo?: string
  cover_url?: string
  domain: any
  custom_domain?: string
  currency: string
  default_currency: string
  timezone: string
  language: string
  status?: string
  is_maintenance: number
  theme: {
    color: string
    font_family: string
    enable_rtl: boolean
    layout: string
  }
  features: {
    reviews_enabled: boolean
    wishlist_enabled: boolean
    courses_enabled: boolean
    subscriptions_enabled: boolean
    coupons_enabled: boolean
  }
  seo: {
    title: string
    description: string
    keywords?: string
  }
  contact_info: {
    email?: string
    phone?: string
    address?: string
    working_hours?: string
  }
  social_links: Array<{
    method: string
    link: string
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
    description: string
    image?: string
    icon?: string
    is_active: number
    sort_order?: number
    products_count: number
  }>
  pages: Array<{
    id: number
    title: string
    url: string
    content: string
  }>
}

/**
 * Server-side API client for SSR
 * Uses secret key authentication directly with fetch
 */
async function makeServerSideAPICall(endpoint: string, options: RequestInit = {}) {
  const publicKey = process.env.NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY
  const secretKey = process.env.STOREFRONT_SECRET_KEY
  
  if (!publicKey || !secretKey) {
    throw new Error('Public and secret keys are required for server-side API calls')
  }

  // Determine API URL - default to production, allow override
  let apiUrl: string
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  } else {
    try {
      const headersList = await headers()
      const host = headersList.get('host')
      
      // For development environments, use local API
      if (host?.includes('localhost') || host?.includes('127.0.0.1') || host?.includes('front.rmz.local')) {
        apiUrl = 'http://front.rmz.local:8000/api'
      } else {
        // Production default
        apiUrl = 'https://front.rmz.gg/api'
      }
    } catch {
      // Fallback for development
      apiUrl = process.env.NODE_ENV === 'development' ? 'http://front.rmz.local:8000/api' : 'https://front.rmz.gg/api'
    }
  }

  // Build headers for secret key authentication
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Public-Key': publicKey,
    'X-Secret-Key': secretKey,
    'X-Timestamp': timestamp,
    'User-Agent': 'StorefrontSSR/2.0',
    ...(options.headers as Record<string, string> || {})
  }

  const fullUrl = `${apiUrl}${endpoint}`

  const response = await fetch(fullUrl, {
    ...options,
    headers: requestHeaders,
    signal: AbortSignal.timeout(15000) // 15 second timeout
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('SSR API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: fullUrl,
      error: errorText
    })
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.success) {
    console.error('SSR API Response Error:', data)
    throw new Error(`API returned error: ${data.message || 'Unknown error'}`)
  }

  return data.data
}

/**
 * Server-side fetch store data for SSR
 * This runs on the server and is cached per request
 */
export const getStoreSSRData = cache(async (): Promise<StoreSSRData | null> => {
  try {
    console.log('Fetching store data for SSR...')
    const storeData = await makeServerSideAPICall('/store')
    console.log('Store data fetched successfully:', storeData?.name)
    return storeData as StoreSSRData
  } catch (error) {
    console.error('Failed to fetch store data:', error)
    return getFallbackStoreData()
  }
})

/**
 * Fallback store data for when API is not available
 * This ensures SSR works with proper metadata, logo, etc.
 */
function getFallbackStoreData(): StoreSSRData {
  return {
    id: 1,
    name: 'Digital Store',
    description: 'Your trusted online store',
    theme: {
      color: '#000000',
      font_family: 'Inter',
      enable_rtl: false,
      layout: 'default'
    },
    features: {
      reviews_enabled: true,
      wishlist_enabled: true,
      courses_enabled: true,
      subscriptions_enabled: true,
      coupons_enabled: true
    },
    seo: {
      title: 'Digital Store',
      description: 'Your trusted online store',
      keywords: 'digital store, online shopping, courses, subscriptions, digital products'
    },
    contact_info: {
      working_hours: null
    },
    social_links: [],
    categories: [],
    pages: [],
    domain: null,
    currency: 'USD',
    default_currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    is_maintenance: 0
  } as StoreSSRData
}

/**
 * Generate meta tags for store SEO
 */
export function generateStoreMetaTags(store: StoreSSRData, path: string = '/') {
  const domain = store.domain?.domain || store.custom_domain || 'localhost'
  const baseUrl = `https://${domain}`
  
  // Use SEO fields first, then fallback to store description and name
  const title = store.seo?.title || store.name
  const description = store.seo?.description || store.description || `Shop at ${store.name} - Your trusted online store`
  const keywords = store.seo?.keywords || `${store.name}, online store, shop, ecommerce`
  
  const ogImage = store.cover_url || store.logo || `${baseUrl}/og-image.jpg`
  const canonicalUrl = `${baseUrl}${path}`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
    },
    other: {
      'theme-color': store.theme?.color || '#000000',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': store.name,
      'application-name': store.name,
      'msapplication-TileColor': store.theme?.color || '#000000',
    }
  }
}

/**
 * Generate structured data (JSON-LD) for store
 */
export function generateStoreStructuredData(store: StoreSSRData) {
  const domain = store.domain?.domain || store.custom_domain || 'localhost'
  const baseUrl = `https://${domain}`
  
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    address: (store as any).address ? {
      '@type': 'PostalAddress',
    } : undefined,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    copyrightHolder: {
      '@type': 'Organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return [organization, website]
}

/**
 * Get favicon URLs for store
 */
export function getStoreFavicons(store: StoreSSRData) {
  // If store has logo, use it as favicon (matching legacy behavior)
  if (store.logo) {
    return {
    }
  }
  
  // Fallback to default favicons
  return {
  }
}

/**
 * Generate PWA manifest for store
 */
export function generateStorePWAManifest(store: StoreSSRData): import('next').MetadataRoute.Manifest {
  return {
    icons: [
      {
      },
      {
      },
    ],
  }
}

/**
 * Server-side fetch product data for SSR
 */
export const getProductSSRData = cache(async (slug: string): Promise<any | null> => {
  try {
    
    const productData = await makeServerSideAPICall(`/products/${slug}`)
    
    if (!productData) {
      return null
    }
    
    return productData
  } catch (error) {
    // Return null instead of fallback for products since each product is unique
    return null
  }
})

/**
 * Server-side fetch category data for SSR
 */
export const getCategorySSRData = cache(async (slug: string): Promise<any | null> => {
  try {
    
    const categoryData = await makeServerSideAPICall(`/categories/${slug}`)
    
    if (!categoryData) {
      throw new Error('Category data is null')
    }
    
    return categoryData
  } catch (error) {
    // Return fallback category data for development
    return {
      updated_at: new Date().toISOString()
    }
  }
})

/**
 * Get page data for SSR - cached for the request lifecycle
 */
export const getPageSSRData = cache(async (url: string): Promise<any | null> => {
  try {
    
    const pageData = await makeServerSideAPICall(`/pages/${url}`)
    return pageData
    
  } catch (error) {
    
    // Return fallback page data for development
    return {
      updated_at: new Date().toISOString()
    }
  }
})

/**
 * Generate product structured data (JSON-LD)
 */
export function generateProductStructuredData(product: any, store: StoreSSRData) {
  const domain = store.domain?.domain || store.custom_domain || 'localhost'
  const baseUrl = `https://${domain}`
  
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    brand: {
      '@type': 'Brand',
    },
    offers: {
      '@type': 'Offer',
      availability: product.stock?.unlimited || product.stock?.available > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
      },
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
    } : undefined,
    review: product.reviews?.map((review: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
      },
      reviewRating: {
        '@type': 'Rating',
      },
    })) || [],
  }

  return structuredData
}

/**
 * Generate category structured data (JSON-LD)
 */
export function generateCategoryStructuredData(category: any, store: StoreSSRData) {
  const domain = store.domain?.domain || store.custom_domain || 'localhost'
  const baseUrl = `https://${domain}`
  
  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    mainEntity: {
      '@type': 'ItemList',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
        },
        {
          '@type': 'ListItem',
        },
        {
          '@type': 'ListItem',
        },
      ],
    },
    publisher: {
      '@type': 'Organization',
    },
  }

  return structuredData
}