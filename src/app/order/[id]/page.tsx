import { Metadata } from 'next';
import { getStoreSSRData } from '@/lib/ssr';
import OrderDetailClient from './OrderDetailClient';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreSSRData();
  
  return {
    title: `طلب #${id}`,
    description: `تفاصيل الطلب رقم ${id} والمنتجات المطلوبة`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return <OrderDetailClient params={params} />;
}