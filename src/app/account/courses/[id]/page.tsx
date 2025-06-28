import { Metadata } from 'next';
import { getStoreSSRData } from '@/lib/ssr';
import CourseDetailClient from './CourseDetailClient';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreSSRData();
  
  return {
    title: 'الدورة التدريبية',
    description: 'محتوى الدورة التدريبية والوحدات التعليمية',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  return <CourseDetailClient params={params} />;
}
