import { Metadata } from 'next';
import { getStoreSSRData } from '@/lib/ssr';
import CoursesClient from './CoursesClient';

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();
  
  return {
    title: 'دوراتي',
    description: 'عرض وإدارة الدورات التدريبية المسجل بها',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CoursesPage() {
  return <CoursesClient />;
}