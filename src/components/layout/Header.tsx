'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import AuthModal from '@/components/auth/AuthModal';
import CurrencySelector from '@/components/CurrencySelector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SearchModal from '@/components/ui/SearchModal';
import { useTranslation } from '@/lib/useTranslation';
import { useStore } from '@/components/StoreProvider';

// Utility function to format phone number
const formatPhoneNumber = (phone: string, countryCode: string = ''): string => {
  if (!phone) return '';
  
  // Remove any existing + or spaces
  const cleanPhone = phone.replace(/^\+?/, '').replace(/\s+/g, '');
  
  // If phone already starts with country code, return formatted
  if (cleanPhone.length > 10) {
    return `+${cleanPhone}`;
  }
  
  // If countryCode is provided, add it
  if (countryCode) {
    return `+${countryCode} ${cleanPhone}`;
  }
  
  // Default Saudi country code if phone seems local
  if (cleanPhone.length === 9 || cleanPhone.length === 10) {
    return `+966 ${cleanPhone}`;
  }
  
  return phone;
};

export default function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [showAllMobileCategories, setShowAllMobileCategories] = useState(false);
  const { isAuthenticated, customer, logout } = useAuth();
  const { count, fetchCart } = useCart();
  const { initializeFromStore } = useCurrency();

  // Refs for click outside detection
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Get store data from SSR context
  const { store } = useStore();

  // Fetch cart on mount for both guest and authenticated users
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Re-fetch cart when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Initialize currency from store data
  useEffect(() => {
    if (store?.currency) {
      initializeFromStore(store.currency);
    }
  }, [store?.currency, initializeFromStore]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter announcements based on current page
  const getVisibleAnnouncements = () => {
    if (!(store as any)?.announcements) return [];
    
    return (store as any).announcements.filter((announcement: any) => {
      // If no route is specified, show on all pages
      if (!announcement.route || announcement.route === 'all') {
        return true;
      }
      
      // Check for specific route patterns
      switch (announcement.route) {
        case 'home':
          return pathname === '/';
        case 'products':
          return pathname.startsWith('/products');
        case 'categories':
          return pathname.startsWith('/categories');
        case 'category':
          return pathname.startsWith('/categories/');
        case 'product':
          return pathname.match(/^\/products\/[^\/]+$/);
        case 'cart':
          return pathname === '/cart';
        case 'account':
          return pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname === '/wishlist';
        default:
          return pathname.includes(announcement.route);
      }
    });
  };

  const visibleAnnouncements = getVisibleAnnouncements();

  return (
    <>
      {/* Store Announcements */}
      {visibleAnnouncements && visibleAnnouncements.length > 0 && (
        <div className="bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto">
            {visibleAnnouncements.map((announcement: any, index: number) => (
              <div
                key={announcement.id}
                className="px-4 py-2 text-center text-sm font-medium flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: announcement.color || undefined,
                  color: announcement.text_color
                }}
              >
                {announcement.icon && (
                  <i className={`${announcement.icon} text-lg`} />
                )}
                {announcement.href ? (
                  <a
                    href={announcement.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: announcement.text_color }}
                  >
                    {announcement.content}
                  </a>
                ) : (
                  <span>{announcement.content}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="bg-background shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              {store?.logo ? (
                <img
                  src={store.logo}
                  alt={store.name || 'Store'}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {(store?.name || 'Store').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
            <Link href="/" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('home')}
            </Link>
            <Link href="/products" className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('products')}
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <span>{t('categories')}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoriesOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-card/90 backdrop-blur-md border border-border/50 rounded-md shadow-lg z-50">
                  <div className="py-1 max-h-80 overflow-y-auto">
                    <Link
                      href="/categories"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-primary hover:bg-muted/50 transition-colors border-b border-border/30"
                    >
{t('view')} {t('categories')}
                    </Link>
                    {(store as any)?.categories?.slice(0, 10).map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{category.icon || '📦'}</span>
                          <span>{category.name}</span>
                          {category.products_count && (
                            <span className="text-xs text-muted-foreground">({category.products_count})</span>
                          )}
                        </div>
                      </Link>
                    ))}
                    {(store as any)?.categories && (store as any).categories.length > 10 && (
                      <Link
                        href="/categories"
                        onClick={() => setIsCategoriesOpen(false)}
                        className="block px-4 py-2 text-sm text-primary hover:bg-muted/50 transition-colors border-t border-border/30 text-center"
                      >
{t('view')} {t('categories')}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Desktop only items */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Currency Selector */}
              <CurrencySelector />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>

            {/* Cart - Always visible */}
            <Link href="/cart" className="p-2 text-muted-foreground hover:text-foreground relative transition-colors">
              <ShoppingCartIcon className="h-6 w-6" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {/* Desktop User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="hidden sm:block">{customer?.first_name}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute rtl:left-0 ltr:right-0 mt-2 w-48 bg-card/90 backdrop-blur-md border border-border/50 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {t('account')}
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {t('orders')}
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {t('wishlist')}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => setIsAuthModalOpen(true)}
              >
                {t('login')}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <div 
              className={`fixed top-0 right-0 h-full w-80 bg-card/95 backdrop-blur-lg border-l border-border/50 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h2 className="text-lg font-semibold text-foreground">{t('menu')}</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 space-y-6">
                    {/* User Section */}
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{customer?.first_name}</p>
                            <p className="text-sm text-muted-foreground text-right" dir="ltr">
                              {customer?.phone ? formatPhoneNumber(customer.phone, customer?.country_code) : customer?.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Link
                            href="/account"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            {t('account')}
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            {t('orders')}
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setIsMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                          >
                            {t('wishlist')}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          {t('login')}
                        </Button>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('navigation')}</h3>
                      <div className="space-y-1">
                        <Link
                          href="/"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          {t('home')}
                        </Link>
                        <Link
                          href="/products"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          {t('products')}
                        </Link>
                        <Link
                          href="/categories"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          {t('categories')}
                        </Link>
                      </div>
                    </div>

                    {/* Categories */}
                    {(store as any)?.categories && (store as any).categories.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('categories')}</h3>
                          {(store as any).categories.length > 3 && (
                            <button
                              onClick={() => setShowAllMobileCategories(!showAllMobileCategories)}
                              className="text-xs text-primary hover:text-primary/80 transition-colors"
                            >
                              {showAllMobileCategories ? 'أقل' : 'المزيد'}
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {(showAllMobileCategories ? (store as any).categories : (store as any).categories.slice(0, 3)).map((category: any) => (
                            <Link
                              key={category.id}
                              href={`/categories/${category.slug}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <span>{category.icon || '📦'}</span>
                                <span>{category.name}</span>
                                {category.products_count && (
                                  <span className="text-xs text-muted-foreground">({category.products_count})</span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tools */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('tools')}</h3>
                      <div className="space-y-4">
                        {/* Search */}
                        <button
                          onClick={() => {
                            setIsSearchModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 rtl:space-x-reverse w-full px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                          <MagnifyingGlassIcon className="h-5 w-5" />
                          <span>{t('search')}</span>
                        </button>

                        {/* Language Switcher */}
                        <div className="px-3">
                          <LanguageSwitcher />
                        </div>

                        {/* Currency Selector */}
                        <div className="px-3">
                          <CurrencySelector />
                        </div>

                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between px-3">
                          <span className="text-sm text-muted-foreground">{t('theme')}</span>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>

                    {/* Logout */}
                    {isAuthenticated && (
                      <div className="pt-4 border-t border-border/50">
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full px-3 py-2 rounded-md text-left rtl:text-right text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          {t('logout')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-border/30">
            <div className="relative">
              <input
                type="text"
                placeholder={t('search')}
                className="w-full px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-colors"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            fetchCart(); // Refresh cart after login
          }}
        />
      </header>
    </>
  );
}