'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';
import { useLanguage } from '@/components/LanguageProvider';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

interface ClientCategoryPageProps {
  slug: string;
  initialCategory?: any;
}

export default function ClientCategoryPage({ slug, initialCategory }: ClientCategoryPageProps) {
  const { locale } = useLanguage();

  // Filter states - matching products page
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);

  // Debounce search term - matching products page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => sdk.categories.getBySlug(slug),
    initialData: initialCategory,
  });

  // Build query parameters for filtering - matching products page validation
  const queryParams = useMemo(() => {
    // Validate and sanitize parameters according to backend validation rules
    const params: any = {
      per_page: Math.min(Math.max(20, 1), 50), // min:1|max:50
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

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'category', slug, queryParams],
    queryFn: () => sdk.categories.getProducts(slug, queryParams),
    enabled: !!category,
  });

  // Use products data directly since search is handled by backend
  const allProducts = useMemo(() => {
    return productsData?.data || [];
  }, [productsData?.data]);

  if (categoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">
            {locale === 'ar' ? 'تحميل الفئة...' : 'Loading category...'}
          </p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {locale === 'ar' ? 'الفئة غير موجودة' : 'Category Not Found'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {locale === 'ar' ? 'لم يتم العثور على الفئة المطلوبة.' : 'The requested category could not be found.'}
            </p>
            <Link href="/categories">
              <Button>
                {locale === 'ar' ? 'تصفح الفئات' : 'Browse Categories'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: locale === 'ar' ? 'جميع الفئات' : 'All Categories', href: '/categories', current: false },
    { name: category?.name || slug, href: `/categories/${slug}`, current: true }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      {/* Category Header */}
      <div className="text-center mb-8">
        <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-8 shadow-xl">
          <div className="text-6xl mb-4">
            {(category as any).icon || '📦'}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-muted-foreground mb-4">{category.description}</p>
          )}
          <div className="text-sm text-muted-foreground">
            {locale === 'ar' ?
              `${(category as any).products_count || 0} منتج متاح` :
              `${(category as any).products_count || 0} products available`
            }
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-4 sm:mb-0">
            {locale === 'ar' ? `المنتجات في ${category.name}` : `Products in ${category.name}`}
          </h2>

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
        {showFilters && (
          <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div className="relative bg-card backdrop-blur-lg border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
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
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {productsLoading ? (
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
      ) : allProducts && allProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {debouncedSearchTerm ? (locale === 'ar' ? 'لا توجد نتائج بحث' : 'No Search Results') : (locale === 'ar' ? 'لا توجد منتجات' : 'No Products Found')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {debouncedSearchTerm ? 
                (locale === 'ar' ? `لم يتم العثور على نتائج لـ "${debouncedSearchTerm}"` : `No results found for "${debouncedSearchTerm}"`) : 
                (locale === 'ar' ? 'هذه الفئة فارغة' : 'This category is empty')
              }
            </p>
            {debouncedSearchTerm ? (
              <Button onClick={() => setSearchTerm('')} variant="outline">
                {locale === 'ar' ? 'مسح البحث' : 'Clear Search'}
              </Button>
            ) : (
              <Link href="/products">
                <Button>
                  {locale === 'ar' ? 'تصفح جميع المنتجات' : 'Browse All Products'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      {allProducts && allProducts.length > 0 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-xl px-6 py-3">
            <span className="text-sm text-muted-foreground">
              {locale === 'ar' ?
                `عرض ${allProducts.length} منتج في ${category.name}` :
                `Showing ${allProducts.length} products in ${category.name}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-card backdrop-blur-lg border-t border-border rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-in-out">
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
          </div>
        </div>
      )}
    </div>
  );
}
