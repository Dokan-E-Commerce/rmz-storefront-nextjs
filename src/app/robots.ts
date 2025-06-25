import type { MetadataRoute } from 'next'
import { getStoreSSRData } from '@/lib/ssr'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const store = await getStoreSSRData()
  
  const baseUrl = store ? `https://${store.domain}` : 'https://localhost:3000'
  
  // If store is not active, disallow all crawling
  if (store?.status !== 'active') {
    return {
      rules: {
      },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/account/',
          '/*.json$',
          '/search?*',
          '/*?*sort=*',
          '/*?*filter=*',
        ],
      }
    ],
  }
}