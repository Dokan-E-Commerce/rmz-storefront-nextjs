import DynamicHomepage from '@/components/homepage/DynamicHomepage';
import { getStoreSSRData, generateStoreMetaTags } from '@/lib/ssr';
import { Metadata } from 'next';

// Generate page-specific metadata
export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();
  
  if (!store) {
    return {
      title: 'Online Store',
      description: 'Discover amazing products and deals at our online store.',
    };
  }

  const title = store.name || 'Online Store';
  const description = store.description || `Welcome to ${store.name}. Discover amazing products, digital courses, subscriptions and more.`;
  
  const keywords = [
    'online store',
    'digital products',
    'e-commerce',
    'shopping',
    store.name,
    store.seo?.keywords
  ].filter(Boolean).join(', ');

  const metaTags = generateStoreMetaTags(store, '/');
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: store.name,
      ...metaTags.openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function HomePage() {
  return <DynamicHomepage />;
}