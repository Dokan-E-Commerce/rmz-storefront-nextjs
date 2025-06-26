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

interface ClientProductPageProps {
  slug: string
  initialProduct?: Product | null
}

export default function ClientProductPage({ slug, initialProduct }: ClientProductPageProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const router = useRouter();
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
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

  // Track hydration to prevent SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  const calculatedPrice = useMemo(() => {
    if (!product) return { total: 0, formatted: formatPriceSafe(0), basePrice: 0, fieldPriceAddition: 0, unitPrice: 0 };

    let basePrice = Number(product.price.actual) || 0;

    if (selectedVariant) {
      basePrice = Number(selectedVariant.price) || 0;
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

    const unitPrice = basePrice + fieldPriceAddition;
    const totalPrice = unitPrice * quantity;

    return {
      basePrice: Number(basePrice) || 0,
      fieldPriceAddition: Number(fieldPriceAddition) || 0,
      unitPrice: Number(unitPrice) || 0,
      total: Number(totalPrice) || 0,
      formatted: formatPriceSafe(totalPrice)
    };
  }, [product, selectedVariant, customFields, quantity, formatPriceSafe, isHydrated]);

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {locale === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'لم يتم العثور على المنتج المطلوب.' : 'The requested product could not be found.'}
          </p>
        </div>
      </div>
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
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldIndex: number, value: string) => {
    setCustomFields(prev => ({ ...prev, [fieldIndex]: value }));
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Login required');
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Get total review count from pagination data
  const totalReviewCount = reviewsData?.pages?.[0]?.pagination?.total || 0;
  
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
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsQuickPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <a href="/" className="text-muted-foreground hover:text-foreground">
                {locale === 'ar' ? 'الرئيسية' : 'Home'}
              </a>
            </li>
            <li>
              <span className="text-muted-foreground">/</span>
            </li>
            <li>
              <a href="/products" className="text-muted-foreground hover:text-foreground">
                {locale === 'ar' ? 'المنتجات' : 'Products'}
              </a>
            </li>
            <li>
              <span className="text-muted-foreground">/</span>
            </li>
            <li>
              <span className="text-foreground font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          <div className="space-y-4">
            <div className="aspect-square bg-card/30 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden">
              {product.image?.full_link || product.image?.url || product.image?.path ? (
                <img
                  src={product.image.full_link || product.image.url || `/storage/${product.image.path}${product.image.filename}`}
                  alt={product.image.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-dashed border-border/40">
                  <svg
                    className="w-24 h-24 text-muted-foreground/50 mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <span className="text-muted-foreground/70 text-center px-4">
                    {locale === 'ar' ? 'لا توجد صورة متاحة' : 'No image available'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.marketing_title && product.marketing_title !== product.name && (
                <div className="mb-3">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    ✨ {product.marketing_title}
                  </span>
                </div>
              )}

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
            </div>

            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {product.type.charAt(0).toUpperCase() + product.type.slice(1)} {locale === 'ar' ? 'منتج' : 'Product'}
            </div>

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
                            {variant.duration} {locale === 'ar' ? 'يوم' : 'days'}
                          </span>
                          <span className="text-lg font-bold">{variant.formatted_price}</span>
                        </div>
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
                  variant={isInWishlist(product.id) ? "default" : "outline"}
                  size="sm"
                  className={`h-10 rounded-lg ${isInWishlist(product.id) ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                >
                  {isInWishlist(product.id) ? (
                    <HeartSolidIcon className="h-4 w-4 mr-2 text-white" />
                  ) : (
                    <HeartIcon className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {isWishlistLoading ?
                      (locale === 'ar' ? 'جاري التحميل...' : 'Loading...') :
                      isInWishlist(product.id) ?
                        (locale === 'ar' ? 'في المفضلة' : 'In Wishlist') :
                        (locale === 'ar' ? 'أضف للمفضلة' : 'Add to Wishlist')
                    }
                  </span>
                  <span className="sm:hidden">
                    {isInWishlist(product.id) ?
                      (locale === 'ar' ? 'في المفضلة' : 'In Wishlist') :
                      (locale === 'ar' ? 'المفضلة' : 'Wishlist')
                    }
                  </span>
                </Button>
                <Button variant="outline" size="sm" className="h-10 rounded-lg">
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
          </div>
        </div>

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
                {locale === 'ar' ? 'المراجعات' : 'Reviews'} {allReviews.length > 0 && `(${allReviews.length})`}
              </h2>

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
    </div>
  );
}
