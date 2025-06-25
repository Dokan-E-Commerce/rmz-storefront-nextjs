'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { productsApi } from '@/lib/store-api';
import { Product } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const queryParams = useMemo(() => ({
    per_page: 20
  }), [query, sortBy, selectedType, priceRange]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query, queryParams],
    queryFn: () => productsApi.search(query),
    enabled: query.length >= 2,
  });

  const products = searchResults?.data || [];

  // Update query from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Search Products</h1>
        
        {/* Search Input */}
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-lg transition-all"
          />
        </div>

        {/* Search Info */}
        {query && (
          <div className="mt-4 text-muted-foreground">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                {products.length > 0 ? (
                  `Found ${products.length} results for "${query}"`
                ) : (
                  `No results found for "${query}"`
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Filter Button */}
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
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
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
                <option value="relevance">Relevance</option>
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

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedType('');
                  setSortBy('relevance');
                  setPriceRange({ min: '', max: '' });
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
            
            <div className="flex justify-end mt-6 pt-6 border-t border-border/50 col-span-full">
              <Button
                onClick={() => setShowFilters(false)}
                className="px-8"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Results */}
      {!query || query.length < 2 ? (
        <div className="text-center py-16">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Start Your Search</h2>
            <p className="text-muted-foreground">Enter at least 2 characters to search for products.</p>
          </div>
        </div>
      ) : isLoading ? (
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
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Results Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any products matching "{query}". Try different keywords or browse our categories.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setQuery('')}>
                Clear Search
              </Button>
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 rounded-t-xl shadow-2xl">
            <div className="flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4">
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="created_desc">Newest First</option>
                      <option value="name_asc">Name A-Z</option>
                      <option value="price_asc">Price Low to High</option>
                      <option value="price_desc">Price High to Low</option>
                    </select>
                  </div>

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
                </div>
              </div>

              <div className="p-4 border-t border-border/50 space-y-3">
                <Button
                  onClick={() => {
                    setSelectedType('');
                    setSortBy('relevance');
                    setPriceRange({ min: '', max: '' });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}