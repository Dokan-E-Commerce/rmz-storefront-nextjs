import type { MetadataRoute } from 'next'
import { getStoreSSRData } from '@/lib/ssr'
import { sdk } from '@/lib/sdk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getStoreSSRData()
  
  if (!store || store.status !== 'active') {
    return []
  }

  const baseUrl = `https://${store.domain}`
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  try {
    // Fetch dynamic content
    const [categoriesResponse, productsResponse] = await Promise.allSettled([
      sdk.categories.getAll(),
      sdk.products.getAll({ per_page: 100 }),
    ])

    // Categories
    let categoryPages: MetadataRoute.Sitemap = []
    if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value) {
      categoryPages = categoriesResponse.value.map((category: any) => ({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(category.updated_at || category.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }

    // Products
    let productPages: MetadataRoute.Sitemap = []
    if (productsResponse.status === 'fulfilled' && productsResponse.value?.data) {
      productPages = productsResponse.value.data.map((product: any) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(product.updated_at || product.created_at),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }))
    }

    // Custom Pages
    const customPages: MetadataRoute.Sitemap = []

    return [...staticPages, ...categoryPages, ...productPages, ...customPages]
  } catch (error) {
    return staticPages
  }
}