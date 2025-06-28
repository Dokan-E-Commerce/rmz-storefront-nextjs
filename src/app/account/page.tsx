import { Metadata } from 'next'
import { getStoreSSRData } from '@/lib/ssr';
import ClientAccountPage from './ClientAccountPage'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreSSRData();
  
  return {
    title: 'حسابي',
    description: 'إدارة إعدادات حسابك ومعلوماتك الشخصية',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  };
}

export default function AccountPage() {
  return <ClientAccountPage />
}