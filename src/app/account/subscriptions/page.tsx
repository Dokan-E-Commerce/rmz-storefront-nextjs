import { Metadata } from 'next';
import { getStoreSSRData } from '@/lib/ssr';
import SubscriptionsClient from './SubscriptionsClient';

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();
  
  return {
    title: 'اشتراكاتي',
    description: 'عرض وإدارة اشتراكاتك النشطة والمنتهية',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SubscriptionsPage() {
  return <SubscriptionsClient />;
}