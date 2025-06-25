'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/hooks/useCart';
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
    created_at: string;
  };
  order?: {
    id: number;
    total: number;
    status: string;
    created_at: string;
  };
}

export default function CheckoutResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();

  // Get parameters from URL - same format as legacy
  const checkoutId = searchParams.get('checkout');
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
        console.error('Checkout result error:', error);
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
      toast.success('Payment completed successfully!');

      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Show details after animation
      setTimeout(() => {
        setShowDetails(true);
      }, 1500);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <ArrowPathIcon className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg text-muted-foreground">Processing your payment result...</p>
          <p className="text-sm text-muted-foreground">Please wait while we confirm your order</p>
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Checkout Link</h1>
          <p className="text-muted-foreground mb-6">
            This checkout link is invalid or has expired. Please try placing your order again.
          </p>
          <div className="space-y-3">
            <Link href="/cart">
              <Button className="w-full">Back to Cart</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Back to Store</Button>
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Payment Successful! 🎉
            </h1>
            
            <p className="text-xl text-muted-foreground mb-2">
              Thank you for your purchase!
            </p>
            
            <p className="text-lg text-muted-foreground">
              Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Order Details Card */}
          <div className="max-w-4xl mx-auto">
            <div className={`bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-8 transition-all duration-1000 ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Order Total */}
              <div className="text-center mb-8 pb-8 border-b border-border/30">
                <h2 className="text-2xl font-bold text-foreground mb-2">Order Total</h2>
                <p className="text-3xl font-bold text-emerald-600">
                  SAR {order.total}
                </p>
                <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mt-2">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Payment Confirmed
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-8">
                <p className="text-lg text-muted-foreground">
                  Your order has been confirmed and is being processed.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Order Status: <span className="font-semibold">{order.status}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isAuthenticated ? (
                  <Link href={`/orders/${order.id}`}>
                    <Button className="w-full">View Order Details</Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button className="w-full">Login to View Order</Button>
                  </Link>
                )}
                
                <Link href="/">
                  <Button variant="outline" className="w-full">Continue Shopping</Button>
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
          
          <h1 className="text-2xl font-bold text-foreground mb-4">Payment Pending</h1>
          
          <p className="text-muted-foreground mb-6">
            Your payment is still being processed. Please wait a moment or contact support if this persists.
          </p>
          
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Checkout ID:</strong> {checkout.id}<br />
              <strong>Amount:</strong> SAR {checkout.amount}<br />
              <strong>Status:</strong> {checkout.status}
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/cart">
              <Button className="w-full">
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => refetch()}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
            
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Store</Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            Need help? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    );
  }

  // Default/processing state
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-lg text-muted-foreground">Processing your request...</p>
      </div>
    </div>
  );
}