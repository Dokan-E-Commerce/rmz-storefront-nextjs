'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';
import { useLanguage } from '@/components/LanguageProvider';

interface ClientCategoryPageProps {
  slug: string;
  initialCategory?: any;
}

export default function ClientCategoryPage({ slug, initialCategory }: ClientCategoryPageProps) {
  const { locale } = useLanguage();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => sdk.categories.getBySlug(slug),
    initialData: initialCategory,
  });

  // Build query parameters for filtering
  const queryParams = useMemo(() => ({
    per_page: 20,
    sort: sortBy,
    ...(selectedType && { type: selectedType }),
    ...(priceRange.min && { min_price: priceRange.min }),
    ...(priceRange.max && { max_price: priceRange.max }),
    ...(inStockOnly && { in_stock: 'true' }),
  }), [sortBy, selectedType, priceRange, inStockOnly]);

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'category', slug, queryParams],
    queryFn: () => sdk.categories.getProducts(slug, queryParams),
    enabled: !!category,
  });

  // Filter products locally by search term if needed
  const filteredProducts = useMemo(() => {
    if (!productsData?.data || !searchTerm) return productsData?.data || [];

    return productsData.data.filter((product: any) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productsData?.data, searchTerm]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        {/* Floating Filter Toggle Button - Show on all screen sizes */}
        <div className="fixed bottom-20 right-6 z-50">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-full w-14 h-14 p-0"
          >
            <FunnelIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilters(false)}
            />
            <div className="relative bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {locale === 'ar' ? 'الفلاتر' : 'Filters'}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {locale === 'ar' ? 'نوع المنتج' : 'Product Type'}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">{locale === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
                  <option value="digital">{locale === 'ar' ? 'منتجات رقمية' : 'Digital Products'}</option>
                  <option value="subscription">{locale === 'ar' ? 'اشتراكات' : 'Subscriptions'}</option>
                  <option value="course">{locale === 'ar' ? 'دورات' : 'Courses'}</option>
                </select>
              </div>

                            {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {locale === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
                <label className="block text-sm font-medium text-foreground mb-2">
                  {locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder={locale === 'ar' ? 'الأدنى' : 'Min'}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <input
                    type="number"
                    placeholder={locale === 'ar' ? 'الأعلى' : 'Max'}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Stock Filter & Clear */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm text-foreground">
                      {locale === 'ar' ? 'المتوفر فقط' : 'In Stock Only'}
                    </span>
                  </label>
                </div>

                <Button
                  onClick={() => {
                    setSelectedType('');
                    setSortBy('created_desc');
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-border/50">
              <Button
                onClick={() => setShowFilters(false)}
                className="px-8"
              >
                {locale === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
              </Button>
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
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {searchTerm ? 'No Search Results' : 'No Products Found'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {searchTerm ? `No results found for "${searchTerm}"` : 'This category is empty'}
            </p>
            {searchTerm ? (
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Clear Search
              </Button>
            ) : (
              <Link href="/products">
                <Button>
                  Browse All Products
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Results Count and Pagination */}
      {filteredProducts && filteredProducts.length > 0 && (
        <div className="mt-12 flex flex-col items-center space-y-4">
          {/* Results Count */}
          <div className="flex items-center space-x-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-xl px-6 py-3">
            <span className="text-sm text-muted-foreground">
              {searchTerm ? (
                <>
                  Showing {filteredProducts.length} results for "{searchTerm}"
                </>
              ) : (
                <>
                  Showing {filteredProducts.length} products in {category.name}
                </>
              )}
            </span>
          </div>

          {/* Pagination - only show if not searching locally */}
          {!searchTerm && productsData?.pagination && productsData.pagination.total > productsData.pagination.per_page && (
            <div className="flex space-x-2">
              {Array.from({ length: productsData.pagination.last_page }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    productsData.pagination.current_page === i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
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
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 rounded-t-xl shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="text-lg font-semibold text-foreground">
                  {locale === 'ar' ? 'الفلاتر' : 'Filters'}
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Product Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Product Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="">All Types</option>
                      <option value="digital">Digital Products</option>
                      <option value="subscription">Subscriptions</option>
                      <option value="course">Courses</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="created_desc">Newest First</option>
                      <option value="created_asc">Oldest First</option>
                      <option value="name_asc">Name A-Z</option>
                      <option value="name_desc">Name Z-A</option>
                      <option value="price_asc">Price Low to High</option>
                      <option value="price_desc">Price High to Low</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Stock Filter */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-sm text-foreground">In Stock Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/50 space-y-3">
                <Button
                  onClick={() => {
                    setSelectedType('');
                    setSortBy('created_desc');
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="w-full"
                >
                  {locale === 'ar' ? 'تطبيق الفلاتر' : 'Apply Filters'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
