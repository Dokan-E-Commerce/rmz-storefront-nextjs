'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/useTranslation';
import { useAddToCart } from '@/hooks/useAddToCart';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/lib/currency';
import { cardVariants, buttonVariants, scaleVariants } from '@/lib/animations';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: {
    original: string;
    actual: string;
    discount?: string;
    formatted: string;
    formatted_original: string;
    discount_percentage: number;
    currency: string;
  };
  image?: {
    id: number;
    url?: string;
    full_link?: string;
    path: string;
    filename: string;
    alt_text?: string;
  };
  rating?: number;
  reviews_count?: number;
  is_discounted?: boolean;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  showAddToCart?: boolean;
  showWishlist?: boolean;
  className?: string;
}

function ProductCard({
  product,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
  className = ""
}: ProductCardProps) {
  const { t } = useTranslation();
  const { addToCart, isAddingToCart } = useAddToCart();
  const { formatPrice, convertPrice } = useCurrency();
  const [imageLoadError, setImageLoadError] = useState(false);

  const hasDiscount = product.is_discounted || product.price.discount_percentage > 0;

  // Convert prices from SAR to selected currency
  const actualPrice = parseFloat(product.price.actual);
  const originalPrice = parseFloat(product.price.original);

  const formattedActualPrice = formatPrice(actualPrice);
  const formattedOriginalPrice = hasDiscount ? formatPrice(originalPrice) : null;

  const handleAddToCart = useCallback(() => {
    addToCart(product, 1);
  }, [addToCart, product]);

  const getCardClasses = () => {
    const baseClasses = "bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-border/50 hover:border-primary/20 transform hover:-translate-y-2";

    switch (variant) {
      case 'compact':
        return `${baseClasses} max-w-sm`;
      case 'featured':
        return `${baseClasses} ring-2 ring-primary/20 shadow-2xl`;
      default:
        return baseClasses;
    }
  };

  const getImageHeight = () => {
    switch (variant) {
      case 'compact':
        return 'h-40';
      case 'featured':
        return 'h-64';
      default:
        return 'h-56';
    }
  };

  return (
    <motion.div 
      className={`${getCardClasses()} ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className={`relative w-full ${getImageHeight()} bg-gradient-to-br from-muted/30 to-muted/50`}>
          {(product.image?.full_link || product.image?.url || product.image?.path) && !imageLoadError ? (
            <Image
              src={product.image.full_link || product.image.url || `/storage/${product.image.path}${product.image.filename}`}
              alt={product.image.alt_text || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-border/40 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-3 text-muted-foreground/50"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <span className="text-xs text-muted-foreground/70 font-medium">{t('no_image_placeholder')}</span>
              </div>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{product.price.discount_percentage}% {t('off')}
            </div>
          )}

          {/* Wishlist button */}
          {showWishlist && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <svg className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className={variant === 'compact' ? 'p-4' : 'p-6'}>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-foreground mb-3 line-clamp-2 hover:text-primary transition-colors text-lg leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`h-4 w-4 ${star <= product.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {product.reviews_count && (
              <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-foreground">
            {formattedActualPrice}
          </span>
          {hasDiscount && formattedOriginalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <motion.div
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            whileHover="visible"
            whileTap="exit"
          >
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart(product.id)}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              size="sm"
            >
            {isAddingToCart(product.id) ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('adding')}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 11-4 0m4 0a2 2 0 114 0" />
                </svg>
                {t('addToCart')}
              </div>
            )}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(ProductCard);
