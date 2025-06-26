'use client';

import { useEffect, useState } from 'react';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';
import { useTranslation } from '@/lib/useTranslation';
import { useCurrency } from '@/lib/currency';
import type { Product } from '@/lib/types';

export default function WishlistPage() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { items, count, isLoading, fetchWishlist, removeFromWishlist, clearWishlist, hasFetched } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      // Always fetch fresh data when authenticated
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId);
      toast.success(t('item_removed_from_wishlist'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product, 1, {}, null);
      toast.success(t('item_added_to_cart'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('error'));
    }
  };

  const handleClearWishlist = async () => {
    if (confirm(t('are_you_sure_clear_wishlist'))) {
      try {
        await clearWishlist();
        toast.success(t('wishlist_cleared'));
      } catch (error: any) {
        toast.error(error.response?.data?.message || t('error'));
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <HeartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('wishlist')}</h1>
            <p className="text-muted-foreground mb-6">{t('login_to_view_wishlist')}</p>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t('login')}
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            fetchWishlist();
          }}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
                  <div className="bg-muted aspect-square rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <HeartSolidIcon className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-foreground">
              {t('wishlist')} ({count} {count === 1 ? t('item') : t('items')})
            </h1>
          </div>
          {count > 0 && (
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-transparent border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>{t('clear_all')}</span>
            </Button>
          )}
        </div>

        {count === 0 ? (
          <div className="text-center py-16">
            <HeartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">{t('wishlist_empty')}</h2>
            <p className="text-muted-foreground mb-6">{t('start_adding_products')}</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t('continue_shopping')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <div key={product.id} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all">
                <div className="relative">
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-muted overflow-hidden">
                      {(product.image?.full_link || product.image?.url) ? (
                        <img
                          src={product.image.full_link || product.image.url}
                          alt={product.image?.alt_text || product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          📦
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-full shadow-md hover:bg-muted/50 transition-colors"
                  >
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-foreground">
                      {product.price?.actual ? formatPrice(parseFloat(product.price.actual)) : 'N/A'}
                    </span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {product.type || 'Product'}
                    </span>
                  </div>

                  {product.categories && product.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.categories.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {category.name || 'Category'}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="sm"
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      {t('add_to_cart')}
                    </Button>
                    <Link href={`/products/${product.slug}`}>
                      <Button variant="outline" size="sm">
                        {t('view')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
