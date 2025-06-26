import { Metadata } from 'next'
import ClientAccountPage from './ClientAccountPage'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your account settings and information',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function AccountPage() {
  return <ClientAccountPage />
}