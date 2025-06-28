'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productsApi, checkoutApi } from '@/lib/store-api';
import { sdk } from '@/lib/sdk';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import type { Product, Review, SubscriptionVariant } from '@/lib/types';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import { useModal } from '@/lib/modal';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';
// import PageTransition from '@/components/ui/PageTransition';

interface ClientProductPageProps {
  slug: string
  initialProduct?: Product | null
}

export default function ClientProductPage({ slug, initialProduct }: ClientProductPageProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const router = useRouter();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { selectedCurrency, formatPrice } = useCurrency();
  const { openAuthModal } = useModal();

  const [quantity, setQuantity] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<SubscriptionVariant | null>(null);
  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isQuickPurchasing, setIsQuickPurchasing] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Track hydration to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  // Safe price formatting that handles SSR
  const formatPriceSafe = (price: number | string) => {
    if (!isHydrated) {
      // During SSR, use the default SAR formatting
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      return `ر.س${numericPrice.toFixed(2)}`;
    }
    return formatPrice(price);
  };

  const { data: product, isLoading: productLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getProduct(slug),
    enabled: !!slug && !initialProduct,
    initialData: initialProduct,
  });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: ({ pageParam = 1 }) => {
      if (!product?.id) return Promise.resolve({ data: [], pagination: { current_page: 1, last_page: 1 } });
      return sdk.products.getReviews(product.id, {
        page: pageParam,
        per_page: 6
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.current_page < lastPage.pagination.last_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: !!product?.id,
  });

  const allReviews = useMemo(() => {
    const reviews = reviewsData?.pages.flatMap(page => page.data) || [];
    // Remove duplicates by keeping only the first occurrence of each review ID
    const seen = new Set();
    return reviews.filter(review => {
      if (!review || !review.id) return false; // Skip invalid reviews
      if (seen.has(review.id)) {
        return false;
      }
      seen.add(review.id);
      return true;
    });
  }, [reviewsData]);

  // Get total review count from pagination data
  const totalReviewCount = reviewsData?.pages?.[0]?.pagination?.total || 0;

  // Calculate review stats - Note: rating distribution is based on loaded reviews only
  const reviewStats = useMemo(() => {
    const totalReviews = totalReviewCount;

    if (!totalReviews || totalReviews === 0) {
      return {
        data: {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
          loaded_reviews_count: 0
        }
      };
    }

    // Use product's rating if available, otherwise calculate from loaded reviews
    const productAverageRating = product?.rating ? Number(product.rating) :
      (allReviews.length > 0 ?
        allReviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0) / allReviews.length : 0);

    // Calculate rating distribution from loaded reviews only
    const ratingDistribution = allReviews.reduce((dist, review) => {
      const rating = review.rating?.toString() || '1';
      dist[rating] = (dist[rating] || 0) + 1;
      return dist;
    }, { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 });

    return {
      data: {
        total_reviews: totalReviews,
        average_rating: productAverageRating,
        rating_distribution: ratingDistribution,
        loaded_reviews_count: allReviews.length
      }
    };
  }, [allReviews, totalReviewCount, product?.rating]);

  const calculatedPrice = useMemo(() => {
    if (!product) return { total: 0, formatted: formatPriceSafe(0), basePrice: 0, fieldPriceAddition: 0, subscriptionPrice: 0, unitPrice: 0 };

    const basePrice = Number(product.price.actual) || 0;
    let subscriptionPrice = 0;

    // For subscription products, add the subscription variant price to the base price
    if (selectedVariant) {
      subscriptionPrice = Number(selectedVariant.price) || 0;
    }

    let fieldPriceAddition = 0;
    if (product.fields) {
      product.fields.forEach((field, index) => {
        const selectedValue = customFields[index];
        if (selectedValue && field.options && field.options[selectedValue]?.price) {
          fieldPriceAddition += Number(field.options[selectedValue].price) || 0;
        }
      });
    }

    const unitPrice = basePrice + subscriptionPrice + fieldPriceAddition;
    const totalPrice = unitPrice * quantity;

    return {
      basePrice: Number(basePrice) || 0,
      subscriptionPrice: Number(subscriptionPrice) || 0,
      fieldPriceAddition: Number(fieldPriceAddition) || 0,
      unitPrice: Number(unitPrice) || 0,
      total: Number(totalPrice) || 0,
      formatted: formatPriceSafe(totalPrice)
    };
  }, [product, selectedVariant, customFields, quantity, formatPriceSafe, isHydrated]);

  if (productLoading) {
    return (
      <motion.div
        className="min-h-screen bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-muted aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !product) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {locale === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'لم يتم العثور على المنتج المطلوب.' : 'The requested product could not be found.'}
          </p>
        </div>
      </motion.div>
    );
  }

  const handleAddToCart = async () => {
    if (product.stock && !product.stock.unlimited && quantity > product.stock.available) {
      toast.error('Requested quantity not available');
      return;
    }

    if (product.stock && !product.stock.unlimited && product.stock.available === 0) {
      toast.error('Out of stock');
      return;
    }

    setIsLoading(true);
    try {
      await addItem(
        product,
        quantity,
        customFields,
        selectedVariant
      );
      toast.success('Product added to cart');
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldIndex: number, value: string) => {
    setCustomFields(prev => ({ ...prev, [fieldIndex]: value }));
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error(t('login_required'));
      openAuthModal();
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast.success(locale === 'ar' ? 'تم الحذف من المفضلة' : 'Removed from wishlist');
      } else {
        await addToWishlist(product.id, product);
        toast.success(locale === 'ar' ? 'تم الإضافة للمفضلة' : 'Added to wishlist');
      }
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Failed to update wishlist';
      toast.error(errorMessage);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description || `Check out ${product.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success(locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
      }
    } catch (error) {
      // If all else fails, try clipboard API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
      } catch (clipboardError) {
        toast.error(locale === 'ar' ? 'فشل في المشاركة' : 'Failed to share');
      }
    }
  };


  // Use product's overall rating if available, otherwise calculate from loaded reviews
  const averageRating = product?.rating ? Number(product.rating) :
    (allReviews.length > 0 ?
      allReviews.reduce((acc: number, review: any) => acc + (Number(review.rating) || 0), 0) / allReviews.length : 0);

  const handleQuickPurchase = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsQuickPurchasing(true);
    try {
      await addItem(product, quantity, customFields, selectedVariant);

      try {
        const checkoutData = await checkoutApi.create();

        // Handle different checkout responses (same logic as cart page)
        if (checkoutData.type === 'free_order') {
          // Free order - redirect to order page
          toast.success(locale === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!');
          router.push(`/order/${checkoutData.order_id}`);
        } else if (checkoutData.type === 'payment_required') {
          // Payment required - redirect to payment page
          if (checkoutData.redirect_url || checkoutData.checkout_url) {
            window.location.href = checkoutData.redirect_url || checkoutData.checkout_url;
          } else {
            toast.error(locale === 'ar' ? 'خطأ في إنشاء رابط الدفع' : 'Error creating payment link');
          }
        } else {
          // Handle generic response format (fallback)
          if (checkoutData.checkout_url) {
            window.location.href = checkoutData.checkout_url;
          } else {
            toast.success(locale === 'ar' ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!');
            router.push('/account');
          }
        }
      } catch (error) {
        // If checkout fails, fallback to cart page
        router.push('/cart');
        return;
      }
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsQuickPurchasing(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.nav
          className="flex mb-8"
          aria-label="Breadcrumb"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <motion.ol
            className="flex items-center space-x-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.li variants={fadeInUp}>
              <motion.a
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {locale === 'ar' ? 'الرئيسية' : 'Home'}
              </motion.a>
            </motion.li>
            <motion.li variants={fadeInUp}>
              <span className="text-muted-foreground">/</span>
            </motion.li>
            <motion.li variants={fadeInUp}>
              <motion.a
                href="/products"
                className="text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {locale === 'ar' ? 'المنتجات' : 'Products'}
              </motion.a>
            </motion.li>
            <motion.li variants={fadeInUp}>
              <span className="text-muted-foreground">/</span>
            </motion.li>
            <motion.li variants={fadeInUp}>
              <span className="text-foreground font-medium">{product.name}</span>
            </motion.li>
          </motion.ol>
        </motion.nav>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="space-y-4"
            variants={fadeInUp}
          >
            <motion.div
              className="aspect-square bg-card/30 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <AnimatePresence mode="wait">
                {(product.image?.full_link || product.image?.url || product.image?.path) && !imageLoadError ? (
                  <motion.img
                    key="product-image"
                    src={product.image.full_link || product.image.url || `/storage/${product.image.path}${product.image.filename}`}
                    alt={product.image.alt_text || product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageLoadError(true)}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-border/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.svg
                      className="w-24 h-24 text-muted-foreground/50 mb-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ type: 'tween', ease: 'easeInOut', duration: 2, repeat: Infinity }}
                    >
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </motion.svg>
                    <motion.span
                      className="text-muted-foreground/70 text-center px-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {t('no_image_placeholder')}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={fadeInUp}
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                className="text-3xl font-bold text-foreground mb-2"
                variants={fadeInUp}
              >
                {product.name}
              </motion.h1>
              <AnimatePresence>
                {product.marketing_title && product.marketing_title !== product.name && (
                  <motion.div
                    className="mb-3"
                    variants={fadeInUp}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <motion.span
                      className="inline-block px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 rounded-full text-sm font-medium backdrop-blur-sm"
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      ✨ {product.marketing_title}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {product.sales?.badge && typeof product.sales.badge === 'object' && (
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm border"
                    style={{
                      color: product.sales.badge.color
                    }}
                  >
                    {product.sales.badge.text}
                  </span>
                )}
                {product.is_new && (
                  <span className="px-3 py-1 text-sm font-medium bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 rounded-full backdrop-blur-sm">
                    🆕 {locale === 'ar' ? 'جديد' : 'New'}
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
                    ⭐ {locale === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                )}
                {product.is_discounted && (
                  <span className="px-3 py-1 text-sm font-medium bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-full backdrop-blur-sm">
                    🔥 {product.price.discount_percentage}% {locale === 'ar' ? 'خصم' : 'Off'}
                  </span>
                )}
                {product.is_noticeable && (
                  <span className="px-3 py-1 text-sm font-medium bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-full backdrop-blur-sm">
                    🎯 {locale === 'ar' ? 'رائج' : 'Trending'}
                  </span>
                )}
              </div>


              {allReviews && allReviews.length > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {star <= averageRating ? (
                          <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({totalReviewCount} {locale === 'ar' ? 'مراجعة' : 'reviews'})
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-foreground">
                    {calculatedPrice.formatted}
                  </span>
                  {product.price.discount && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPriceSafe(product.price.original)}
                    </span>
                  )}
                </div>
                {product.price.discount && (
                  <span className="text-sm text-green-600 font-medium">
                    {locale === 'ar' ? `وفر ${product.price.discount}%` : `Save ${product.price.discount}%`}
                  </span>
                )}
                {(quantity > 1 || calculatedPrice.fieldPriceAddition > 0) && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {quantity > 1 && (
                      <span>
                        {formatPriceSafe(calculatedPrice.unitPrice)} {locale === 'ar' ? 'للقطعة' : 'each'} × {quantity}
                      </span>
                    )}
                    {calculatedPrice.fieldPriceAddition > 0 && (
                      <span className="block">
                        + {formatPriceSafe(calculatedPrice.fieldPriceAddition)} {locale === 'ar' ? 'للخيارات' : 'for options'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {product.type.charAt(0).toUpperCase() + product.type.slice(1)} {locale === 'ar' ? 'منتج' : 'Product'}
            </div>

                        {/* Course Information */}
            {product.type === 'course' && product.course && (
              <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {locale === 'ar' ? 'تفاصيل الدورة' : 'Course Details'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Instructor */}
                  <div className="flex items-center bg-muted/30 backdrop-blur-sm border border-border/30 rounded-lg p-4">
                    <div className="bg-primary/20 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {locale === 'ar' ? 'المدرب' : 'Instructor'}
                      </p>
                      <p className="text-foreground font-semibold">{product.course.instructor}</p>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="flex items-center bg-muted/30 backdrop-blur-sm border border-border/30 rounded-lg p-4">
                    <div className="bg-primary/20 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {locale === 'ar' ? 'المستوى' : 'Level'}
                      </p>
                      <p className="text-foreground font-semibold">
                        {locale === 'ar' ? product.course.level_arabic : product.course.level.charAt(0).toUpperCase() + product.course.level.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center bg-muted/30 backdrop-blur-sm border border-border/30 rounded-lg p-4">
                    <div className="bg-primary/20 rounded-full p-2 mr-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        {locale === 'ar' ? 'عدد الدروس' : 'Modules'}
                      </p>
                      <p className="text-foreground font-semibold">
                        {product.course.total_modules || 0} {locale === 'ar' ? 'درس' : 'modules'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Curriculum */}
                {product.course.sections && product.course.sections.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {locale === 'ar' ? 'منهج الدورة' : 'Course Curriculum'}
                    </h4>
                    <div className="space-y-3">
                      {product.course.sections.map((section, index) => (
                        <div key={section.id} className="bg-muted/20 backdrop-blur-sm border border-border/30 rounded-lg overflow-hidden">
                          <div className="p-4 bg-muted/30 border-b border-border/30">
                            <h5 className="font-semibold text-foreground flex items-center">
                              <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                                {index + 1}
                              </span>
                              {section.title}
                            </h5>
                            {section.description && (
                              <p className="text-muted-foreground text-sm mt-1 mr-9">{section.description}</p>
                            )}
                          </div>
                          {section.modules && section.modules.length > 0 && (
                            <div className="p-4">
                              <div className="space-y-2">
                                {section.modules.map((module, moduleIndex) => (
                                  <div key={module.id} className="flex items-center text-sm">
                                    <svg className="w-4 h-4 text-primary mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4h6zM4 20h16" />
                                    </svg>
                                    <span className="text-foreground flex-1">{module.title}</span>
                                    {module.duration_minutes > 0 && (
                                      <span className="text-muted-foreground text-xs bg-muted/30 px-2 py-1 rounded">
                                        {module.duration_minutes} {locale === 'ar' ? 'دقيقة' : 'min'}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {product.subscription_variants && product.subscription_variants.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {locale === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
                </h3>
                <div className="space-y-2">
                  {product.subscription_variants.map((variant) => (
                    <label
                      key={variant.id}
                      className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="subscription"
                        value={variant.id}
                        checked={selectedVariant?.id === variant.id}
                        onChange={() => setSelectedVariant(variant)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {locale === 'ar' ? (variant.duration_text || variant.duration) : (variant.duration_text_en || variant.duration)}
                          </span>
                          <span className="text-lg font-bold">{formatPriceSafe(variant.price)}</span>
                        </div>
                        {variant.features && variant.features.length > 0 && (
                          <div className="mt-2">
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {variant.features.map((feature) => (
                                <li key={feature.id} className="flex items-center">
                                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {product.fields && product.fields.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-foreground mb-3">
                  {locale === 'ar' ? 'خيارات المنتج' : 'Product Options'}
                </h3>
                <div className="space-y-4">
                  {product.fields.map((field, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {field.name} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' && field.options ? (
                        <select
                          className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          value={customFields[index] || ''}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          required={field.required}
                        >
                          <option value="">
                            {locale === 'ar' ? 'اختر خياراً' : 'Select an option'}
                          </option>
                          {Object.entries(field.options).map(([key, option]: [string, any]) => (
                            <option key={key} value={key}>
                              {option.name} {option.price && `(+${formatPrice(option.price)})`}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={3}
                          value={customFields[index] || ''}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          required={field.required}
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          value={customFields[index] || ''}
                          onChange={(e) => handleFieldChange(index, e.target.value)}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {locale === 'ar' ? 'الكمية' : 'Quantity'}
              </label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border border-border rounded-md text-center min-w-[60px] bg-background text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const maxQuantity = product.stock?.unlimited ? quantity + 1 : Math.min(quantity + 1, product.stock?.available || 1);
                    setQuantity(maxQuantity);
                  }}
                  disabled={product.stock && !product.stock.unlimited && quantity >= product.stock.available}
                  className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading || (product.stock && !product.stock.unlimited && product.stock.available === 0)}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-lg border-2"
                >
                  {isLoading ?
                    (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                    (locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart')
                  }
                </Button>
                <Button
                  onClick={handleQuickPurchase}
                  disabled={isQuickPurchasing || (product.stock && !product.stock.unlimited && product.stock.available === 0)}
                  className="bg-primary hover:bg-primary/90 h-12 rounded-lg shadow-lg"
                  size="lg"
                >
                  {isQuickPurchasing ?
                    (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                    (locale === 'ar' ? 'اشتر الآن' : 'Buy Now')
                  }
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={isHydrated && isInWishlist(product.id) ? "default" : "outline"}
                  size="sm"
                  className={`h-10 rounded-lg ${isHydrated && isInWishlist(product.id) ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                >
                  {isHydrated && isInWishlist(product.id) ? (
                    <HeartSolidIcon className="h-4 w-4 mr-2 text-white" />
                  ) : (
                    <HeartIcon className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isWishlistLoading ?
                      (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                      isHydrated && isInWishlist(product.id) ?
                        (locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from Wishlist') :
                        (locale === 'ar' ? 'أضف للمفضلة' : 'Add to Wishlist')
                    }
                  </span>
                  <span className="sm:hidden">
                    {isHydrated && isInWishlist(product.id) ?
                      (locale === 'ar' ? 'إزالة' : 'Remove') :
                      (locale === 'ar' ? 'المفضلة' : 'Wishlist')
                    }
                  </span>
                </Button>
                <Button variant="outline" size="sm" className="h-10 rounded-lg" onClick={handleShare}>
                  <ShareIcon className="h-4 w-4 mr-2" />
                  {locale === 'ar' ? 'مشاركة' : 'Share'}
                </Button>
              </div>
            </div>

            {(quantity > 1 || calculatedPrice.fieldPriceAddition > 0 || selectedVariant) && (
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-2">
                  {locale === 'ar' ? 'إجمالي السعر' : 'Total Price'}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{locale === 'ar' ? 'السعر الأساسي:' : 'Base Price:'}</span>
                    <span>{formatPrice(calculatedPrice.basePrice)}</span>
                  </div>
                  {calculatedPrice.subscriptionPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{locale === 'ar' ? 'خطة الاشتراك:' : 'Subscription Plan:'}</span>
                      <span>+{formatPrice(calculatedPrice.subscriptionPrice)}</span>
                    </div>
                  )}
                  {calculatedPrice.fieldPriceAddition > 0 && (
                    <div className="flex justify-between">
                      <span>{locale === 'ar' ? 'الخيارات:' : 'Options:'}</span>
                      <span>+{formatPrice(calculatedPrice.fieldPriceAddition)}</span>
                    </div>
                  )}
                  {quantity > 1 && (
                    <div className="flex justify-between">
                      <span>{locale === 'ar' ? 'الكمية:' : 'Quantity:'}</span>
                      <span>× {quantity}</span>
                    </div>
                  )}
                  <hr className="border-border/30" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{locale === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                    <span>{calculatedPrice.formatted}</span>
                  </div>
                </div>
              </div>
            )}

            {product.stock && (
              <div className="text-sm">
                {product.stock.unlimited ? (
                  <span className="text-green-600">
                    ✓ {locale === 'ar' ? 'متوفر في المخزن' : 'In Stock'}
                  </span>
                ) : product.stock.available > 0 ? (
                  <span className="text-green-600">
                    ✓ {product.stock.available} {locale === 'ar' ? 'متوفر' : 'available'}
                  </span>
                ) : (
                  <span className="text-red-600">
                    ✗ {locale === 'ar' ? 'نفد من المخزن' : 'Out of Stock'}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </h2>
              {product.description ? (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-muted-foreground">
                  {locale === 'ar' ? 'لا يوجد وصف متاح' : 'No description available'}
                </p>
              )}
            </div>

            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {locale === 'ar' ? 'المراجعات' : 'Reviews'} ({reviewStats?.data?.total_reviews ?? totalReviewCount})
              </h2>

              {/* Review Stats */}
              {reviewStats?.data && reviewStats.data.total_reviews > 0 && (
                <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= Math.round(reviewStats.data.average_rating) ? (
                                <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                              ) : (
                                <StarIcon className="h-5 w-5 text-gray-300" />
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-2xl font-bold text-foreground">
                          {reviewStats.data.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        {locale === 'ar'
                          ? `بناءً على ${reviewStats.data.total_reviews} تقييم`
                          : `Based on ${reviewStats.data.total_reviews} reviews`
                        }
                      </p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center text-sm">
                          <span className="w-8 text-muted-foreground">{rating}★</span>
                          <div className="w-24 h-2 bg-muted rounded-full mx-2">
                            <div
                              className="h-2 bg-yellow-400 rounded-full"
                              style={{
                                width: `${
                                  reviewStats.data.loaded_reviews_count > 0
                                    ? ((reviewStats.data.rating_distribution[rating.toString()] || 0) / reviewStats.data.loaded_reviews_count) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground">
                            {reviewStats.data.rating_distribution[rating.toString()] || 0}
                          </span>
                        </div>
                      ))}
                      {reviewStats.data.loaded_reviews_count < reviewStats.data.total_reviews && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {locale === 'ar' ?
                            `* التوزيع بناءً على ${reviewStats.data.loaded_reviews_count} من أصل ${reviewStats.data.total_reviews} تقييم` :
                            `* Distribution based on ${reviewStats.data.loaded_reviews_count} of ${reviewStats.data.total_reviews} reviews`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse border-b pb-4">
                      <div className="h-4 bg-muted/50 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : allReviews.length > 0 ? (
                <div className="space-y-6">
                  {allReviews.map((review: any, index: number) => (
                    <div key={`review-${review.id || index}`} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star}>
                              {star <= review.rating ? (
                                <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                              ) : (
                                <StarIcon className="h-4 w-4 text-muted-foreground" />
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="font-medium text-foreground">{review.reviewer.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground">{review.comment}</p>
                    </div>
                  ))}

                  <div className="flex justify-center py-4">
                    {isFetchingNextPage && (
                      <div className="space-y-4 w-full">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse border-b pb-4">
                            <div className="h-4 bg-muted/50 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isFetchingNextPage && hasNextPage && (
                      <Button
                        onClick={() => fetchNextPage()}
                        variant="outline"
                        className="w-full max-w-xs"
                      >
                        {locale === 'ar' ? 'تحميل المزيد من المراجعات' : 'Load More Reviews'}
                      </Button>
                    )}
                    {!hasNextPage && allReviews.length > 0 && (
                      <div className="text-center text-muted-foreground text-sm">
                        {locale === 'ar' ? 'تم تحميل جميع المراجعات' : 'All reviews loaded'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {locale === 'ar' ? 'لا توجد مراجعات حتى الآن' : 'No reviews yet'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-foreground mb-4">
                {locale === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'رقم المنتج' : 'SKU'}
                  </dt>
                  <dd className="text-sm font-medium text-foreground">#{product.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'النوع' : 'Type'}
                  </dt>
                  <dd className="text-sm font-medium text-foreground capitalize">{product.type}</dd>
                </div>
                {(product.sales?.sold_count ?? 0) > 0 && (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'المبيعات' : 'Sales'}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {product.sales?.sold_count} {locale === 'ar' ? 'تم بيعها' : 'sold'}
                    </dd>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      {locale === 'ar' ? 'العلامات' : 'Tags'}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">{product.tags.join(', ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
