import type { MetadataRoute } from 'next'
import { getStoreSSRData } from '@/lib/ssr'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const store = await getStoreSSRData()
  
  // Get the base URL from environment variables or store domain
  const baseUrl = process.env.NEXTAUTH_URL || 
    process.env.NEXT_PUBLIC_SITE_URL || 
    (store?.custom_domain ? `https://${store.custom_domain}` : 
     store?.domain ? `https://${store.domain}` : 'https://localhost:3000')
  
  // If store is in maintenance mode, disallow all crawling
  if (store?.is_maintenance || store?.status !== 'active') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/categories',
          '/categories/*',
          '/pages/*',
          '/search',
          '/courses',
          '/courses/*',
          '/reviews'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/checkout/*',
          '/account/',
          '/account/*',
          '/orders',
          '/orders/*',
          '/wishlist',
          '/success',
          '/_next/',
          '/private/',
          '/*.json$',
          '/*?*sort=*',
          '/*?*filter=*',
          '/*?*page=*',
          '/*?*limit=*'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/categories',
          '/categories/*',
          '/pages/*',
          '/search',
          '/courses',
          '/courses/*',
          '/reviews'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/checkout/*',
          '/account/',
          '/account/*',
          '/orders',
          '/orders/*',
          '/wishlist',
          '/success',
          '/_next/',
          '/private/',
          '/*.json$'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}