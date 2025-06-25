'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/useTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { t } = useTranslation();
  const { customer, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();

  // Check both state and localStorage for authentication
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthReady = Boolean(isAuthenticated && hasToken);

  if (!isAuthReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4">Please Login</h1>
            <p className="text-muted-foreground mb-8">Login is required to access this page</p>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              {t('login')}
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  const navigationItems = [
    { key: 'profile', label: t('profile'), href: '/account', exact: true },
    { key: 'orders', label: t('orders'), href: '/orders', exact: false },
    { key: 'subscriptions', label: t('subscriptions'), href: '/account/subscriptions', exact: true },
    { key: 'courses', label: t('courses'), href: '/account/courses', exact: true },
    { key: 'wishlist', label: t('wishlist'), href: '/wishlist', exact: true },
  ];

  const isActiveLink = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-muted/50 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {customer?.first_name?.charAt(0)}{customer?.last_name?.charAt(0)}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {customer?.full_name}
                </h2>
                <p className="text-sm text-muted-foreground">{customer?.email}</p>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`block w-full text-left px-4 py-2 rounded-md transition-colors ${
                      isActiveLink(item.href, item.exact)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
