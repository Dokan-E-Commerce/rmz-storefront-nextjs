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
import { useAuth } from '@/lib/auth';
import { useModal } from '@/lib/modal';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleVariants } from '@/lib/animations';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useModal();

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal();
    }
  };

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
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Glass background with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/30"></div>

      {/* Tab content */}
      <div className="relative flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {tabs.map((tab, index) => {
          const IconComponent = tab.isActive ? tab.activeIcon : tab.icon;

          return (
            <motion.div
              key={tab.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={tab.href}
                onClick={tab.name === t('account') ? handleAccountClick : undefined}
                className="relative block"
              >
                <motion.div
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                    tab.isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={tab.isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  <motion.div className="relative">
                    <motion.div
                      whileHover={{ rotate: tab.isActive ? 0 : 15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <IconComponent
                        className={`h-6 w-6 transition-colors ${
                          tab.isActive
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </motion.div>

                    {/* Badge for cart count */}
                    <AnimatePresence>
                      {tab.badge && (
                        <motion.div 
                          className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: 1,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1.2 }}
                          transition={{
                            scale: { duration: 0.5, repeat: Infinity, repeatDelay: 2, type: "tween", ease: "easeInOut" },
                            opacity: { duration: 0.2, type: "tween" }
                          }}
                        >
                          {tab.badge > 99 ? '99+' : tab.badge}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.span 
                    className={`text-xs font-medium mt-1 transition-colors ${
                      tab.isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                    animate={tab.isActive ? { scale: 1.05 } : { scale: 1 }}
                  >
                    {tab.name}
                  </motion.span>

                  {/* Active indicator */}
                  <AnimatePresence>
                    {tab.isActive && (
                      <motion.div 
                        className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
