'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ShoppingBagIcon, 
  BookOpenIcon, 
  PlayIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface CheckoutResult {
  checkout?: {
    id: string;
    amount: number;
    status: string;
    payment_method?: string;
    payment_id?: string;
    created_at: string;
  };
  order?: {
    id: number;
    total: number;
    status: string;
    created_at: string;
  };
}

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const { t } = useTranslation();

  // Get parameters from URL - using txid as the parameter
  const checkoutId = searchParams.get('txid');
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');

  // Fetch checkout result
  const { data: result, isLoading, error, refetch } = useQuery<CheckoutResult>({
    queryKey: ['checkout-result', checkoutId],
    queryFn: async () => {
      if (!checkoutId) {
        throw new Error('No checkout ID provided');
      }

      try {
        // Call the checkout result endpoint with the checkout ID
        const response = await sdk.checkout.getResult(checkoutId);
        return response;
      } catch (error: any) {
        throw error;
      }
    },
    enabled: !!checkoutId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Handle successful payment
  useEffect(() => {
    if (result?.order && !celebrationPlayed) {
      setCelebrationPlayed(true);

      // Clear the cart on successful payment
      clearCart();

      // Show success toast
      toast.success(t('order_placed_successfully'));

      // Trigger enhanced confetti animation
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const colors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];

      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
        zIndex: 1000
      });

      // Continuous effect
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          ticks: 100,
          gravity: 0.8,
          decay: 0.93,
          startVelocity: 20,
          zIndex: 1000
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          ticks: 100,
          gravity: 0.8,
          decay: 0.93,
          startVelocity: 20,
          zIndex: 1000
        });
      }, 200);

      // Show details after a short delay
      setTimeout(() => {
        setShowDetails(true);
      }, 800);
    }
  }, [result, celebrationPlayed, clearCart]);

  // Handle failed payment
  useEffect(() => {
    if (result && !result.order && !isLoading) {
      toast.error('Payment verification failed. Please contact support.');
    }
  }, [result, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute inset-4 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">{t('verifying_transaction')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t('confirm_payment_details')}
            </p>
          </div>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !checkoutId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-pink-50 dark:from-red-900/20 dark:via-red-800/20 dark:to-pink-900/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('invalid_checkout_link')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('checkout_link_invalid_expired')}
          </p>
          <div className="space-y-3">
            <Link href="/cart">
              <Button className="w-full">{t('back_to_cart')}</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">{t('back_to_store')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (result?.order) {
    const order = result.order;
    const checkout = result.checkout;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        {/* Subtle animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container max-w-2xl mx-auto px-4 py-12">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                <CheckCircleIcon className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t('order_received')}
            </h1>
            
            <p className="text-lg text-muted-foreground">
              {t('thank_you_for_purchase')}
            </p>
          </div>

          {/* Order Details Card */}
          <div className={`bg-card border border-border rounded-xl shadow-sm transition-all duration-700 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Order Info */}
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Order #{order.id}</span>
                <span>{new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>

              {/* Order Total */}
              <div className="text-center py-8 border-y border-border">
                <p className="text-sm text-muted-foreground mb-1">{t('order_total')}</p>
                <p className="text-4xl font-bold text-foreground mb-3">
                  SAR {order.total}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                  <CheckCircleIcon className="h-4 w-4" />
                  {t('order_received')}
                </div>
              </div>

              {/* Order Status and Payment Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t('status')}</p>
                    <p className="font-medium text-foreground">{order.status || 'Processing'}</p>
                  </div>
                  
                  {result?.checkout?.payment_method && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">{t('payment_method')}</p>
                      <p className="font-medium text-foreground capitalize">{result.checkout.payment_method}</p>
                    </div>
                  )}
                </div>

                {result?.checkout?.payment_id && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t('payment_id')}</p>
                    <p className="font-medium text-foreground font-mono text-sm">{result.checkout.payment_id}</p>
                  </div>
                )}
                
                <p className="text-sm text-center text-muted-foreground">
                  {t('order_confirmed_processing')}
                </p>
                
                <p className="text-sm text-center text-muted-foreground">
                  {t('email_confirmation_shortly')}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {isAuthenticated ? (
                  <Link href={`/order/${order.id}`} className="contents">
                    <Button className="w-full" size="lg">
                      {t('view_order_details')}
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" className="contents">
                    <Button className="w-full" size="lg">
                      {t('login_to_view_order')}
                    </Button>
                  </Link>
                )}
                
                <Link href="/" className="contents">
                  <Button variant="outline" className="w-full" size="lg">
                    {t('continue_shopping')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed payment state (when we have checkout but no order)
  if (result && result.checkout && !result.order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ExclamationTriangleIcon className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('payment_pending')}</h1>
          
          <p className="text-muted-foreground mb-6">
            {t('payment_still_processing')}
          </p>
          
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>{t('transaction_id')}:</strong> {result?.checkout?.id || checkoutId}<br />
              <strong>{t('amount')}:</strong> SAR {result?.checkout?.amount || 'N/A'}<br />
              <strong>{t('status')}:</strong> {result?.checkout?.status || 'Pending'}
              {result?.checkout?.payment_method && (
                <><br /><strong>{t('payment_method')}:</strong> {result.checkout.payment_method}</>
              )}
              {result?.checkout?.payment_id && (
                <><br /><strong>{t('payment_id')}:</strong> {result.checkout.payment_id}</>
              )}
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/cart">
              <Button className="w-full">
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                {t('back_to_cart')}
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => refetch()}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              {t('retry')}
            </Button>
            
            <Link href="/">
              <Button variant="ghost" className="w-full">{t('back_to_store')}</Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            {t('need_help')} <Link href="/contact" className="text-primary hover:underline">{t('contact_support')}</Link>
          </p>
        </div>
      </div>
    );
  }

  // Default/processing state
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">{t('processing_request')}</h3>
          <p className="text-sm text-muted-foreground">{t('please_wait_moment')}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{t('loading_checkout')}</h3>
          <p className="text-sm text-muted-foreground">{t('please_wait')}</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutResultContent />
    </Suspense>
  );
}