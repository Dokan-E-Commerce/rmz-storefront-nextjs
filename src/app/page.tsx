import DynamicHomepage from '@/components/homepage/DynamicHomepage';
import { getStoreSSRData, generateStoreMetaTags } from '@/lib/ssr';
import { Metadata } from 'next';

// Generate page-specific metadata
export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();
  
  if (!store) {
    return {};
  }

  const metaTags = generateStoreMetaTags(store, '/');
  
  return {
    openGraph: {
      ...metaTags.openGraph,
    },
  };
}

export default function HomePage() {
  return <DynamicHomepage />;
}