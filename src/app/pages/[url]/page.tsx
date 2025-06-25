import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getStoreSSRData, generateStoreMetaTags, getPageSSRData } from '@/lib/ssr'
import ClientPageDetail from './ClientPageDetail'

interface PageProps {
  params: Promise<{
    url: string
  }>
}

// Generate metadata for page SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { url } = await params
  const store = await getStoreSSRData()
  
  if (!store) {
    return {
    }
  }

  try {
    // Fetch page data for SEO using new SSR function
    const page = await getPageSSRData(url)
    
    if (!page) {
      return {
      }
    }
    
    const pageTitle = page.title
    const pageDescription = page.excerpt || (page.content ? page.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : `${pageTitle} - ${store.name}`)
    
    const metaTags = generateStoreMetaTags(store, `/pages/${url}`)
    
    return {
      keywords: [
        pageTitle,
        'page',
        'information',
        store.name,
        'content'
      ].join(', '),
      openGraph: {
        ...metaTags.openGraph,
      },
      twitter: {
        ...metaTags.twitter,
      },
      other: {
        ...metaTags.other,
        'article:author': store.name,
        'article:section': 'Information',
      }
    }
  } catch (error) {
    return {
    }
  }
}

export default async function PageDetail({ params }: PageProps) {
  const { url } = await params
  
  if (!url) {
    notFound()
  }

  // Fetch page and store data for structured data
  const store = await getStoreSSRData()
  const page = await getPageSSRData(url)

  return (
    <ClientPageDetail url={url} initialPage={page} />
  )
}