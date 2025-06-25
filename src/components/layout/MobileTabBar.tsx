'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  ShoppingBagIcon as ShoppingBagSolidIcon,
  HeartIcon as HeartSolidIcon,
  UserIcon as UserSolidIcon,
  Squares2X2Icon as Squares2X2SolidIcon
} from '@heroicons/react/24/solid';
import { useCart } from '@/lib/cart';
import { useTranslation } from '@/lib/useTranslation';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { t } = useTranslation();

  const tabs = [
    {
      name: t('home'),
      href: '/',
      icon: HomeIcon,
      activeIcon: HomeSolidIcon,
      isActive: pathname === '/'
    },
    {
      name: t('categories'),
      href: '/categories',
      icon: Squares2X2Icon,
      activeIcon: Squares2X2SolidIcon,
      isActive: pathname.startsWith('/categories')
    },
    {
      name: t('cart'),
      href: '/cart',
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagSolidIcon,
      isActive: pathname === '/cart',
      badge: count > 0 ? count : undefined
    },
    {
      name: t('wishlist'),
      href: '/wishlist',
      icon: HeartIcon,
      activeIcon: HeartSolidIcon,
      isActive: pathname === '/wishlist'
    },
    {
      name: t('account'),
      href: '/account',
      icon: UserIcon,
      activeIcon: UserSolidIcon,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/orders')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      {/* Glass background with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/30"></div>

      {/* Tab content */}
      <div className="relative flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {tabs.map((tab) => {
          const IconComponent = tab.isActive ? tab.activeIcon : tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                tab.isActive
                  ? 'bg-primary/10 scale-105'
                  : 'hover:bg-muted/50 active:scale-95'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`h-6 w-6 transition-colors ${
                    tab.isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                />

                {/* Badge for cart count */}
                {tab.badge && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </div>
                )}
              </div>

              <span className={`text-xs font-medium mt-1 transition-colors ${
                tab.isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}>
                {tab.name}
              </span>

              {/* Active indicator */}
              {tab.isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
