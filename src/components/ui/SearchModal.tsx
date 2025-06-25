'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => sdk.products.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const handleProductClick = () => {
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out">
          {/* Search Input */}
          <div className="flex items-center p-4 border-b border-border/30">
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-2 p-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.length === 0 ? (
              <div className="p-8 text-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('search')}...</p>
              </div>
            ) : isLoading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchResults && searchResults.data && searchResults.data.length > 0 ? (
              <div className="p-2">
                {searchResults.data.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleProductClick}
                    className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.image?.url ? (
                        <img
                          src={product.image.url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {(product.short_description || product.description)?.replace(/<[^>]*>/g, '').substring(0, 80) + ((product.short_description || product.description)?.length > 80 ? '...' : '')}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="font-semibold text-primary">
                          {product.price.formatted}
                        </span>
                        {product.categories && product.categories.length > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {product.categories[0].name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}

                {searchResults.data.length >= 8 && (
                  <div className="p-3 text-center border-t border-border/30">
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      onClick={handleProductClick}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View All Products ({searchResults.data.length}+)
                    </Link>
                  </div>
                )}
              </div>
            ) : debouncedQuery.length > 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try searching with different keywords
                </p>
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-border/30 bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navigate</span>
                <span>⏎ Select</span>
                <span>Esc Close</span>
              </div>
              <span>Powered by rmz.gg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
