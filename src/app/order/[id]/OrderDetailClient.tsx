'use client';

import { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { sdk } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AuthModal from '@/components/auth/AuthModal';
import AccountLayout from '@/components/layout/AccountLayout';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProvider';

interface OrderDetailClientProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailClient({ params }: OrderDetailClientProps) {
  const { id } = use(params);
  const { locale } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [storeRating, setStoreRating] = useState(0);
  const [itemRatings, setItemRatings] = useState<Record<number, number>>({});
  const [storeComment, setStoreComment] = useState('');
  const [itemComments, setItemComments] = useState<Record<number, string>>({});
  const { isAuthenticated } = useAuth();

  // Translations
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'order_items': 'عناصر الطلب',
        'order_tracking': 'تتبع الطلب',
        'order_summary': 'ملخص الطلب',
        'payment_details': 'تفاصيل الدفع',
        'payment_method': 'طريقة الدفع',
        'transaction_id': 'معرف المعاملة',
        'refund_status': 'حالة الاسترداد',
        'subtotal': 'المجموع الفرعي',
        'discount': 'الخصم',
        'total': 'الإجمالي',
        'back_to_account': 'العودة إلى الحساب',
        'placed_on': 'تم الطلب في',
        'quantity': 'الكمية',
        'each': 'لكل واحد',
        'order_note': 'ملاحظة الطلب',
        'coupon_applied': 'تم تطبيق الكوبون',
        'not_refunded': 'لم يتم الاسترداد',
        'refunded': 'تم الاسترداد',
        'loading_order': 'جاري تحميل تفاصيل الطلب...',
        'order_not_found': 'الطلب غير موجود',
        'please_login': 'يرجى تسجيل الدخول',
        'login_to_view': 'يرجى تسجيل الدخول لعرض تفاصيل طلبك',
        'login': 'تسجيل الدخول',
        'order_not_found_desc': 'الطلب الذي تبحث عنه غير موجود أو ليس لديك صلاحية لعرضه.',
        'no_items_found': 'لم يتم العثور على عناصر',
        'free': 'مجاني',
        'hours_ago': 'منذ ساعات',
        'review_submitted': 'تم تقديم المراجعة بالفعل',
        'thank_you_feedback': 'شكراً لك على ملاحظاتك!',
        'store_review': 'مراجعة المتجر',
        'rating': 'التقييم',
        'comment': 'التعليق',
        'review_already_submitted': 'تم تقديم المراجعة بالفعل',
        'review_your_order': 'راجع طلبك',
        'review_store': 'راجع المتجر',
        'share_experience': 'شارك تجربتك مع هذا المتجر...',
        'share_thoughts': 'شارك أفكارك حول هذا المنتج...',
        'submit_review': 'تقديم المراجعة',
        'please_select_rating': 'يرجى اختيار تقييم',
        'please_write_comment': 'يرجى كتابة تعليق',
        'review_submitted_success': 'تم تقديم المراجعة بنجاح',
        'copy': 'نسخ',
        'code_copied': 'تم نسخ الرمز إلى الحافظة',
        'digital_cards': 'البطائق الرقمية',
        'preview_download': 'معاينة / تحميل',
        'unknown_product': 'منتج غير معروف',
        'no_image': 'لا توجد صورة'
      },
      en: {
        'order_items': 'Order Items',
        'order_tracking': 'Order Tracking',
        'order_summary': 'Order Summary',
        'payment_details': 'Payment Details',
        'payment_method': 'Payment Method',
        'transaction_id': 'Transaction ID',
        'refund_status': 'Refund Status',
        'subtotal': 'Subtotal',
        'discount': 'Discount',
        'total': 'Total',
        'back_to_account': 'Back to Account',
        'placed_on': 'Placed on',
        'quantity': 'Quantity',
        'each': 'each',
        'order_note': 'Order Note',
        'coupon_applied': 'Coupon Applied',
        'not_refunded': 'Not Refunded',
        'refunded': 'Refunded',
        'loading_order': 'Loading order details...',
        'order_not_found': 'Order Not Found',
        'please_login': 'Please Login',
        'login_to_view': 'Please login to view your order details',
        'login': 'Login',
        'order_not_found_desc': 'The order you\'re looking for doesn\'t exist or you don\'t have permission to view it.',
        'no_items_found': 'No items found',
        'free': 'free',
        'hours_ago': 'hours ago',
        'review_submitted': 'Review Already Submitted',
        'thank_you_feedback': 'Thank you for your feedback!',
        'store_review': 'Store Review',
        'rating': 'Rating',
        'comment': 'Comment',
        'review_already_submitted': 'Review Already Submitted',
        'review_your_order': 'Review Your Order',
        'review_store': 'Review Store',
        'share_experience': 'Share your experience with this store...',
        'share_thoughts': 'Share your thoughts about this product...',
        'submit_review': 'Submit Review',
        'please_select_rating': 'Please select a rating',
        'please_write_comment': 'Please write a comment',
        'review_submitted_success': 'Review submitted successfully',
        'copy': 'Copy',
        'code_copied': 'Code copied to clipboard',
        'digital_cards': 'Digital Cards',
        'preview_download': 'Preview / Download',
        'unknown_product': 'Unknown Product',
        'no_image': 'No Image'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };

  // Unwrap params using React.use() - already done above

  // Check both state and localStorage for authentication
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthReady = Boolean(isAuthenticated && hasToken);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => sdk.orders.getById(parseInt(id)),
    enabled: isAuthReady,
  });

  if (!isAuthReady) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('please_login')}</h1>
            <p className="text-muted-foreground mb-8">{t('login_to_view')}</p>
            <Button onClick={() => setIsAuthModalOpen(true)}>
              {t('login')}
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading_order')}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <XCircleIcon className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('order_not_found')}</h1>
            <p className="text-muted-foreground mb-8">{t('order_not_found_desc')}</p>
            <Link href="/account">
              <Button>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {t('back_to_account')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'fulfilled':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusDotColor = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'danger':
        return 'bg-red-500';
      case 'secondary':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Check if order is completed (status 3 or 4 based on legacy logic)
  const isOrderCompleted = (() => {
    if (!order?.status) return false;
    const status = order.status as any;
    
    // Check status.status field (this is the actual status number)
    if (typeof status === 'object' && status !== null && status.status) {
      return status.status === 3 || status.status === 4;
    }
    
    // Fallback to status.id
    if (typeof status === 'object' && status !== null && status.id) {
      return status.id === 3 || status.id === 4;
    }
    
    // Fallback to string comparison
    return status === 'completed' || status === 'delivered' || status === 'مكتمل';
  })();



  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (storeRating === 0) {
      toast.error(t('please_select_rating'));
      return;
    }

    if (!storeComment.trim()) {
      toast.error(t('please_write_comment'));
      return;
    }

    // Check if all items have ratings
    const missingItemRatings = order.items?.some((_: any, index: number) => !itemRatings[index]);
    if (missingItemRatings) {
      toast.error(t('please_select_rating'));
      return;
    }

    // Check if all items have comments
    const missingItemComments = order.items?.some((_: any, index: number) => !itemComments[index]?.trim());
    if (missingItemComments) {
      toast.error(t('please_write_comment'));
      return;
    }

    try {
      // Prepare form data to match backend validation
      const reviewData: any = {
        rating: storeRating,
        comment: storeComment,
        item_ratings: {},
        item_comments: {}
      };

      // Add item ratings and comments
      order.items?.forEach((item: any, index: number) => {
        reviewData.item_ratings[item.id] = itemRatings[index] || 0;
        reviewData.item_comments[item.id] = itemComments[index] || '';
      });

      // Submit review using SDK
      await sdk.orders.submitReview(order.id, reviewData);

      toast.success(t('review_submitted_success'));
      // Refresh the order data to show the submitted review
      window.location.reload();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(errorMessage);
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('back_to_account')}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order #{(order as any).order_number || order.id}</h1>
              <p className="text-muted-foreground mt-1">
                {t('placed_on')} {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon((order.status as any)?.name || order.status || 'pending')}
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor((order.status as any)?.color || 'secondary')}`}>
                {(order.status as any)?.human_format?.text || (order.status as any)?.name || order.status || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">{t('order_items')}</h2>

              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-muted/50 rounded-xl overflow-hidden">
                          {item.item?.image?.full_link ? (
                            <img
                              src={item.item.image.full_link}
                              alt={item.item?.name || t('unknown_product')}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              {t('no_image')}
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-lg mb-2">
                            {item.item?.name || t('unknown_product')}
                          </h3>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span>{t('quantity')}: {item.quantity}</span>
                            <span>•</span>
                            <span>ر.س{typeof item.price === 'number' ? (item.price / item.quantity).toFixed(2) : (parseFloat(item.price || 0) / item.quantity).toFixed(2)} {t('each')}</span>
                          </div>

                          {/* Based on legacy order.twig logic - exact implementation */}

                          {/* Digital Codes - matches: {% if item.item.type == "code" and (order.status.status == 3 or order.status.status == 4) %} */}
                                                    {item.item?.type === 'code' && ((order.status as any)?.status === 3 || (order.status as any)?.status === 4 || (order.status as any)?.id === 3 || (order.status as any)?.id === 4) && item.codes && item.codes.length > 0 && (
                                                          <div className="mb-4">
                                <div className="text-sm font-medium text-foreground mb-3">{t('digital_cards')}:</div>
                                <div className="space-y-2">
                                                                    {item.codes && item.codes.length > 0 ? item.codes.map((code: any, codeIndex: number) => (
                                    <div key={codeIndex} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <code className="font-mono text-sm text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/50 px-3 py-2 rounded flex-1 mr-3">
                                          {code.code}
                                        </code>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(code.code);
                                            toast.success(t('code_copied'));
                                          }}
                                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                                        >
                                          {t('copy')}
                                        </button>
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="text-muted-foreground text-sm">
                                      No codes available yet. Codes will appear when order is completed.
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}

                          {/* Subscription Information - matches: {% if item.subscription %} */}
                          {item.subscription && (
                            <div className="mb-4">
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                {item.subscription.durationText || `${item.subscription.duration} days`} - ينتهي في ({item.subscription.end_date || "-"})
                              </div>
                            </div>
                          )}

                          {/* Custom Fields - handles both legacy and new formats */}
                          {item.fields && typeof item.fields === 'object' && Object.keys(item.fields).length > 0 && (
                            <div className="mb-4">
                              <div className="space-y-1">
                                {(() => {
                                  // Handle legacy format: [{"name": "valuem", "price": "23", "value": "v1"}]
                                  if (Array.isArray(item.fields)) {
                                    return item.fields.map((field: any, fieldIndex: number) => (
                                      <div key={fieldIndex} className="text-sm text-muted-foreground">
                                        {field.name} : {field.value} {field.price && `(+${field.price} ر.س)`}
                                      </div>
                                    ));
                                  }
                                  
                                  // Handle incorrect format: {"0": {"name": "valuem", "price": "23", "value": "v1"}}
                                  return Object.entries(item.fields).map(([key, field]: [string, any], fieldIndex: number) => {
                                    // If field is an object with name/value/price, use it directly
                                    if (field && typeof field === 'object' && field.name && field.value) {
                                      return (
                                        <div key={fieldIndex} className="text-sm text-muted-foreground">
                                          {field.name} : {field.value} {field.price && `(+${field.price} ر.س)`}
                                        </div>
                                      );
                                    }
                                    
                                    // Fallback for any other format
                                    return (
                                      <div key={fieldIndex} className="text-sm text-muted-foreground">
                                        {key} : {String(field)}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Product Download/Preview - matches: {% if item.item.type == "product" and (order.status.status == 3 or order.status.status == 4) %} */}
                          {item.item?.type === 'product' && ((order.status as any)?.status === 3 || (order.status as any)?.status === 4 || (order.status as any)?.id === 3 || (order.status as any)?.id === 4) && item.item?.product?.full_link && (
                            <div className="mb-4">
                              <a
                                href={item.item.product.full_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
                              >
                                {t('preview_download')}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xl font-bold text-foreground">
                            ر.س{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">{t('no_items_found')}</p>
              )}
            </div>

            {/* Review Section - Only show for completed orders (status 3 or 4) */}
            {isOrderCompleted && (
              <div className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
                {(order as any).review ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{t('review_already_submitted')}</h2>
                      <p className="text-sm text-muted-foreground">{t('thank_you_feedback')}</p>
                    </div>
                  </div>

                  <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">S</span>
                        </div>
                        <h3 className="font-semibold text-foreground">{t('store_review')}</h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-foreground">{t('rating')}:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-xl">
                              {star <= ((order as any).review?.rating || 0) ? (
                                <span className="text-yellow-400">★</span>
                              ) : (
                                <span className="text-gray-300">☆</span>
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({(order as any).review?.rating || 0}/5)
                        </span>
                      </div>

                      {(order as any).review?.comment && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-foreground">{t('comment')}:</span>
                          <p className="text-muted-foreground mt-2 bg-muted/30 p-4 rounded-lg italic">
                            "{(order as any).review.comment}"
                          </p>
                        </div>
                      )}

                      <div className="mt-4 text-xs text-muted-foreground">
                        {t('review_submitted')} • {new Date((order as any).review.created_at || order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>

                    {/* Individual Item Reviews */}
                    {(() => {
                      const itemReviews = (order as any).review?.item_reviews;
                      if (!itemReviews) return false;
                      
                      // Handle both array and object formats
                      if (Array.isArray(itemReviews)) {
                        return itemReviews.length > 0;
                      } else {
                        return Object.keys(itemReviews).length > 0;
                      }
                    })() && (
                      <div className="mt-6 space-y-4">
                        <h4 className="text-lg font-semibold text-foreground mb-4">{locale === 'ar' ? 'تقييمات المنتجات' : 'Product Reviews'}</h4>
                        {order.items?.map((item: any, index: number) => {
                          const itemReviews = (order as any).review.item_reviews;
                          let itemReview = null;
                          
                          // Handle both array and object formats
                          if (Array.isArray(itemReviews)) {
                            // For array format, we need to match by some criteria
                            // Since we only have one item in this order, take the first review
                            itemReview = itemReviews[0];
                          } else {
                            // For object format, use the item_id as key
                            itemReview = itemReviews[item.item_id];
                          }
                          
                          if (!itemReview) return null;

                          return (
                            <div key={index} className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-xl p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-muted/50 rounded-lg overflow-hidden">
                                  {item.item?.image?.full_link ? (
                                    <img
                                      src={item.item.image.full_link}
                                      alt={item.item?.name || t('unknown_product')}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                      ?
                                    </div>
                                  )}
                                </div>
                                <h5 className="font-medium text-foreground">{item.item?.name || t('unknown_product')}</h5>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-foreground">{t('rating')}:</span>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-lg">
                                      {star <= (itemReview.rating || 0) ? (
                                        <span className="text-yellow-400">★</span>
                                      ) : (
                                        <span className="text-gray-300">☆</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({itemReview.rating || 0}/5)
                                </span>
                              </div>

                              {itemReview.comment && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-foreground">{t('comment')}:</span>
                                  <p className="text-muted-foreground mt-1 bg-muted/20 p-3 rounded-lg italic text-sm">
                                    "{itemReview.comment}"
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">{t('review_your_order')}</h2>
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    {/* Store Review */}
                    <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                          <span className="text-primary font-bold text-lg">S</span>
                        </div>
                        <h4 className="font-semibold text-foreground text-lg">{t('review_store')}</h4>
                      </div>

                      {/* Store Rating */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">{t('rating')}:</label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              className={`text-3xl transition-colors duration-200 ${
                                star <= storeRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                              }`}
                              onClick={() => setStoreRating(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Store Comment */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">{t('comment')}:</label>
                        <textarea
                          value={storeComment}
                          onChange={(e) => setStoreComment(e.target.value)}
                          className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200"
                          rows={3}
                          placeholder={t('share_experience')}
                          dir="auto"
                        />
                      </div>
                    </div>

                    {/* Individual Item Reviews */}
                    {order.items && order.items.map((item: any, index: number) => (
                      <div key={index} className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-muted/50 rounded-xl overflow-hidden mr-4">
                            {item.item?.image?.full_link ? (
                              <img
                                src={item.item.image.full_link}
                                alt={item.item?.name || t('unknown_product')}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                {t('no_image')}
                              </div>
                            )}
                          </div>
                          <h4 className="font-semibold text-foreground text-lg">{item.item?.name || t('unknown_product')}</h4>
                        </div>

                        {/* Item Rating */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-foreground mb-2">{t('rating')}:</label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={`text-3xl transition-colors duration-200 ${
                                  star <= (itemRatings[index] || 0) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                                }`}
                                onClick={() => setItemRatings(prev => ({ ...prev, [index]: star }))}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Item Comment */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">{t('comment')}:</label>
                          <textarea
                            value={itemComments[index] || ''}
                            onChange={(e) => setItemComments(prev => ({ ...prev, [index]: e.target.value }))}
                            className="w-full px-4 py-3 border border-border/50 rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all duration-200"
                            rows={2}
                            placeholder={t('share_thoughts')}
                            dir="auto"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      {t('submit_review')}
                    </button>
                  </form>
                </div>
              )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Order Tracking */}
            {(order as any).statuses && (order as any).statuses.length > 0 && (
              <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">{t('order_tracking')}</h2>
                <div className="space-y-4">
                  {(order as any).statuses
                    .slice()
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((status: any, index: number) => (
                      <div key={status.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-4 h-4 rounded-full mt-1.5 ${
                          index === 0
                            ? getStatusDotColor(status.color) + ' ring-4 ring-opacity-20 ' + getStatusDotColor(status.color).replace('bg-', 'ring-')
                            : 'bg-muted'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${
                              index === 0 ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {status.human_format?.text || status.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {status.human_format?.date_human}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(status.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">{t('order_summary')}</h2>

              <div className="space-y-4">
                                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('subtotal')}</span>
                  <span>
                    {typeof order?.total === 'object' && order?.total && (order.total as any)?.formatted
                      ? 'ر.س' + ((order.total as any).formatted as string).replace('$', '').replace('USD', '').replace('ر.س', '').trim()
                      : `ر.س${parseFloat(order?.total as any || 0).toFixed(2)}`}
                  </span>
                </div>

                {(order as any).discount_amount && parseFloat((order as any).discount_amount as any) > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{t('discount')}</span>
                    <span>-ر.س{parseFloat((order as any).discount_amount as any).toFixed(2)}</span>
                  </div>
                )}

                <hr className="border-border/30" />

                                  <div className="flex justify-between text-xl font-bold text-foreground">
                    <span>{t('total')}</span>
                  <span>
                    {typeof order?.total === 'object' && order?.total && (order.total as any)?.formatted
                      ? 'ر.س' + ((order.total as any).formatted as string).replace('$', '').replace('USD', '').replace('ر.س', '').trim()
                      : `ر.س${parseFloat(order?.total as any || 0).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Customer Note */}
              {(order as any).customer_note && (
                <div className="mt-6 pt-6 border-t border-border/30">
                  <h3 className="font-medium text-foreground mb-2">{t('order_note')}</h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{(order as any).customer_note}</p>
                </div>
              )}

              {/* Coupon Info */}
              {(order as any).coupon && (
                <div className="mt-6 pt-6 border-t border-border/30">
                  <h3 className="font-medium text-foreground mb-3">{t('coupon_applied')}</h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-700 dark:text-green-300">{(order as any).coupon.code}</span>
                      <span className="text-sm font-semibold text-green-800 dark:text-green-200">{(order as any).coupon.formatted_value}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              {(order as any).transaction && (
                <div className="mt-6 pt-6 border-t border-border/30">
                  <h3 className="font-medium text-foreground mb-3">{t('payment_details')}</h3>
                  <div className="space-y-3 text-sm overflow-hidden">
                    {/* Mobile-friendly layout for payment details */}
                                          <div className="flex justify-between items-start gap-4">
                        <span className="text-muted-foreground flex-shrink-0">{t('payment_method')}</span>
                        <span className="font-medium text-foreground text-right break-words max-w-[200px]">{(order as any).transaction.payment_method || t('free')}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                        <span className="text-muted-foreground flex-shrink-0">{t('transaction_id')}</span>
                        <div className="flex items-center gap-2 sm:max-w-[200px] w-full sm:w-auto">
                          <span 
                            className="font-medium text-foreground break-all overflow-hidden text-sm cursor-help flex-1 sm:text-right" 
                            title={(order as any).transaction.payment_id || '-'}
                          >
                            {(order as any).transaction.payment_id || '-'}
                          </span>
                          {(order as any).transaction.payment_id && (order as any).transaction.payment_id !== '-' && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText((order as any).transaction.payment_id);
                                toast.success(t('code_copied'));
                              }}
                              className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
                              title={t('copy')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-muted-foreground flex-shrink-0">{t('refund_status')}</span>
                                              <span className={`font-medium px-2 py-1 rounded-full text-xs flex-shrink-0 ${
                          (order as any).transaction.is_refunded
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {(order as any).transaction.is_refunded ? t('refunded') : t('not_refunded')}
                        </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
