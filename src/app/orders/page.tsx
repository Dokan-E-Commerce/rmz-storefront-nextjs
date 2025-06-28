import { Metadata } from 'next';
import { getStoreSSRData } from '@/lib/ssr';
import OrdersClient from './OrdersClient';

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();
  
  return {
    title: 'طلباتي',
    description: 'عرض وإدارة طلباتك السابقة والحالية',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function OrdersPage() {
  return <OrdersClient />;
}
