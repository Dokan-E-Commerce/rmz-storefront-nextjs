'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteProducts } from '@/lib/useInfiniteProducts';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '@/components/LanguageProvider';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { pageVariants, pageTransition, containerVariants, itemVariants, fadeVariants } from '@/lib/animations';

export default function ClientProductsPage() {
  const { locale } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  const queryParams = useMemo(() => {
    // Validate and sanitize parameters according to backend validation rules
    const params: any = {
      per_page: Math.min(Math.max(12, 1), 50), // min:1|max:50
    };

    // Search validation: max:255
    if (debouncedSearchTerm && debouncedSearchTerm.trim().length <= 255) {
      params.search = debouncedSearchTerm.trim();
    }

    // Sort validation: in:price_asc,price_desc,name_asc,name_desc,created_asc,created_desc
    const validSorts = ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_asc', 'created_desc'];
    if (sortBy && validSorts.includes(sortBy)) {
      params.sort = sortBy;
    }

    // Type validation: in:digital,subscription,course
    const validTypes = ['digital', 'subscription', 'course'];
    if (selectedType && validTypes.includes(selectedType)) {
      params.type = selectedType;
    }

    // Price validation: numeric|min:0
    if (priceRange.min && !isNaN(Number(priceRange.min)) && Number(priceRange.min) >= 0) {
      params.price_min = Number(priceRange.min);
    }
    if (priceRange.max && !isNaN(Number(priceRange.max)) && Number(priceRange.max) >= 0) {
      params.price_max = Number(priceRange.max);
    }

    // Stock validation: boolean - send as string "1" which Laravel accepts as boolean true
    if (inStockOnly) {
      params.in_stock = "1";
    }

    return params;
  }, [debouncedSearchTerm, sortBy, selectedType, priceRange.min, priceRange.max, inStockOnly]);

  const {
    data: productsData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(queryParams);

  // Auto-load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into single array and deduplicate by ID
  const allProducts = useMemo(() => {
    const products = productsData?.pages.flatMap(page => page.data) || [];
    // Remove duplicates by keeping only the first occurrence of each product ID
    const seen = new Set();
    return products.filter(product => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [productsData]);


  const breadcrumbItems = [
    { name: locale === 'ar' ? 'جميع المنتجات' : 'All Products', href: '/products', current: true }
  ];

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4 sm:mb-0">
          {locale === 'ar' ? 'جميع المنتجات' : 'All Products'}
        </h1>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={locale === 'ar' ? 'البحث عن المنتجات...' : 'Search products...'}
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              // Enforce max length of 255 characters to match backend validation
              if (value.length <= 255) {
                setSearchTerm(value);
              }
            }}
            maxLength={255}
            className="w-full sm:w-64 px-4 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden animate-pulse">
              <div className="h-48 bg-muted/50"></div>
              <div className="p-4">
                <div className="h-4 bg-muted/50 rounded mb-2"></div>
                <div className="h-4 bg-muted/50 rounded w-3/4 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-muted/50 rounded w-1/4"></div>
                  <div className="h-8 bg-muted/50 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {allProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  custom={index}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="mt-12 flex justify-center">
            {isFetchingNextPage && (
              <div className="flex items-center space-x-3 bg-card/30 backdrop-blur-md border border-border/50 rounded-xl px-6 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-foreground">
                  {locale === 'ar' ? 'تحميل المزيد...' : 'Loading more...'}
                </span>
              </div>
            )}
            {!hasNextPage && allProducts.length > 0 && (
              <div className="flex items-center space-x-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-xl px-6 py-3">
                <span className="text-sm text-muted-foreground">
                  {locale === 'ar' ?
                    `عرض جميع ${allProducts.length} منتج` :
                    `Showing all ${allProducts.length} products`
                  }
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Filter Toggle Button - Show on all screen sizes */}
      <div className="fixed bottom-20 right-6 rtl:right-auto rtl:left-6 z-50">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-full w-14 h-14 p-0"
        >
          <FunnelIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div 
              className="relative bg-card backdrop-blur-lg border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold text-foreground">
                {locale === 'ar' ? 'الفلاتر' : 'Filters'}
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Product Type & Sort By */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {locale === 'ar' ? 'نوع المنتج' : 'Product Type'}
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate against backend accepted values: digital,subscription,course
                        const validTypes = ['', 'digital', 'subscription', 'course'];
                        if (validTypes.includes(value)) {
                          setSelectedType(value);
                        }
                      }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">{locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                      <option value="digital">{locale === 'ar' ? 'منتجات رقمية' : 'Digital Products'}</option>
                      <option value="subscription">{locale === 'ar' ? 'اشتراكات' : 'Subscriptions'}</option>
                      <option value="course">{locale === 'ar' ? 'دورات' : 'Courses'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {locale === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Validate against backend accepted values: price_asc,price_desc,name_asc,name_desc,created_asc,created_desc
                        const validSorts = ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_asc', 'created_desc'];
                        if (validSorts.includes(value)) {
                          setSortBy(value);
                        }
                      }}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="created_desc">{locale === 'ar' ? 'الأحدث أولا' : 'Newest First'}</option>
                      <option value="created_asc">{locale === 'ar' ? 'الأقدم أولا' : 'Oldest First'}</option>
                      <option value="name_asc">{locale === 'ar' ? 'الاسم أ-ي' : 'Name A-Z'}</option>
                      <option value="name_desc">{locale === 'ar' ? 'الاسم ي-أ' : 'Name Z-A'}</option>
                      <option value="price_asc">{locale === 'ar' ? 'السعر من الأقل للأعلى' : 'Price Low to High'}</option>
                      <option value="price_desc">{locale === 'ar' ? 'السعر من الأعلى للأقل' : 'Price High to Low'}</option>
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder={locale === 'ar' ? 'الأدنى' : 'Minimum'}
                      value={priceRange.min}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive numbers (min:0 in backend validation)
                        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                          setPriceRange(prev => ({ ...prev, min: value }));
                        }
                      }}
                      min="0"
                      step="0.01"
                      className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      placeholder={locale === 'ar' ? 'الأعلى' : 'Maximum'}
                      value={priceRange.max}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive numbers (min:0 in backend validation)
                        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                          setPriceRange(prev => ({ ...prev, max: value }));
                        }
                      }}
                      min="0"
                      step="0.01"
                      className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {locale === 'ar' ? 'المتوفر فقط' : 'In Stock Only'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <Button
                  onClick={() => {
                    setSelectedType('');
                    setSortBy('created_desc');
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                  }}
                  variant="outline"
                  className="sm:w-auto"
                >
                  {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="sm:w-auto px-8"
                >
                  {locale === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                </Button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal */}
            <motion.div 
              className="fixed bottom-0 left-0 right-0 bg-card backdrop-blur-lg border-t border-border rounded-t-2xl shadow-2xl"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
            <div className="flex flex-col max-h-[85vh] min-h-[50vh]">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">
                  {locale === 'ar' ? 'الفلاتر' : 'Filters'}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {locale === 'ar' ? 'نوع المنتج' : 'Product Type'}
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                    >
                      <option value="">{locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                      <option value="digital">{locale === 'ar' ? 'منتجات رقمية' : 'Digital Products'}</option>
                      <option value="subscription">{locale === 'ar' ? 'اشتراكات' : 'Subscriptions'}</option>
                      <option value="course">{locale === 'ar' ? 'دورات' : 'Courses'}</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {locale === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                    >
                      <option value="created_desc">{locale === 'ar' ? 'الأحدث أولا' : 'Newest First'}</option>
                      <option value="created_asc">{locale === 'ar' ? 'الأقدم أولا' : 'Oldest First'}</option>
                      <option value="name_asc">{locale === 'ar' ? 'الاسم أ-ي' : 'Name A-Z'}</option>
                      <option value="name_desc">{locale === 'ar' ? 'الاسم ي-أ' : 'Name Z-A'}</option>
                      <option value="price_asc">{locale === 'ar' ? 'السعر من الأقل للأعلى' : 'Price Low to High'}</option>
                      <option value="price_desc">{locale === 'ar' ? 'السعر من الأعلى للأقل' : 'Price High to Low'}</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder={locale === 'ar' ? 'الأدنى' : 'Minimum'}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                      />
                      <input
                        type="number"
                        placeholder={locale === 'ar' ? 'الأعلى' : 'Maximum'}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                      />
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <label className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-base font-medium text-foreground">
                        {locale === 'ar' ? 'المتوفر فقط' : 'In Stock Only'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/20">
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setSelectedType('');
                      setSortBy('created_desc');
                      setPriceRange({ min: '', max: '' });
                      setInStockOnly(false);
                    }}
                    variant="outline"
                    className="w-full py-3 text-base"
                    size="lg"
                  >
                    {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 text-base"
                    size="lg"
                  >
                    {locale === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                  </Button>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}