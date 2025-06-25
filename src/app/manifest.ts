import type { MetadataRoute } from 'next'
import { getStoreSSRData, generateStorePWAManifest } from '@/lib/ssr'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const store = await getStoreSSRData()
  
  if (!store) {
    // Fallback manifest
    return {
      name: 'Digital Store',
      short_name: 'Store',
      description: 'Digital storefront',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    }
  }

  return generateStorePWAManifest(store)
}