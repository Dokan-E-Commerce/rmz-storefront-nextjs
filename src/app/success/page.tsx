'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CheckCircleIcon, 
  ShoppingBagIcon, 
  BookOpenIcon, 
  PlayIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { isAuthenticated } = useAuth();

  // Get order ID from URL params
  const orderId = searchParams.get('order_id') || searchParams.get('order');
  const checkoutId = searchParams.get('checkout_id');

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => sdk.orders.getById(parseInt(orderId!)),
    enabled: !!orderId,
  });

  // Celebration effects
  useEffect(() => {
    if (!celebrationPlayed && orderId) {
      setCelebrationPlayed(true);

      // Fireworks confetti
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
        
        // Left side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Right side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Hearts confetti after 1 second
      setTimeout(() => {
        confetti({
          colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#ff6347']
        });
      }, 1000);

      // Show order details after animation
      setTimeout(() => {
        setShowOrderDetails(true);
      }, 2000);
    }
  }, [celebrationPlayed, orderId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/success' + window.location.search));
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading your success details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-6">We couldn't find your order details. Please check your account or contact support.</p>
          <div className="space-y-3">
            <Link href="/account/orders">
              <Button className="w-full">View My Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Back to Store</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getProductTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'course':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'subscription':
        return <ClockIcon className="h-5 w-5" />;
      case 'digital':
        return <DownloadIcon className="h-5 w-5" />;
      default:
        return <ShoppingBagIcon className="h-5 w-5" />;
    }
  };

  const getRandomEmoji = () => {
    const emojis = ['🎉', '🎊', '🥳', '🎁', '✨', '🌟', '💫', '🔥', '🚀', '💎'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <CheckCircleIcon className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            Payment Successful! {getRandomEmoji()}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Thank you for your purchase!
          </p>
          
          <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="max-w-4xl mx-auto">
          <div className={`bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-8 transition-all duration-1000 ${showOrderDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Order Total */}
            <div className="text-center mb-8 pb-8 border-b border-border/30">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                <span className="text-2xl font-bold text-emerald-600">💰</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Order Total</h2>
              <p className="text-3xl font-bold text-emerald-600">{(order as any).formatted_total}</p>
              {order.status && (
                <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mt-2">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {(order.status as any)?.name || 'Confirmed'}
                </div>
              )}
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
                  <ShoppingBagIcon className="h-6 w-6 mr-2 text-primary" />
                  Your Items ({order.items.length})
                </h3>
                
                <div className="grid gap-4">
                  {order.items.map((item: any, index: number) => (
                    <div 
                      key={item.id} 
                      className="flex items-center p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-all duration-300 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 mr-4">
                        {item.item?.image ? (
                          <img 
                            src={item.item.image} 
                            alt={item.item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {getProductTypeIcon(item.item?.type)}
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1 truncate">
                          {item.item?.name || item.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>{item.formatted_price}</span>
                          {item.item?.type && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                {getProductTypeIcon(item.item.type)}
                                <span className="ml-1 capitalize">{item.item.type}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {item.item?.type === 'course' && (
                        <Link href={`/courses/${item.item.slug || item.item.id}`}>
                          <Button size="sm" className="flex items-center">
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Start Learning
                          </Button>
                        </Link>
                      )}
                      
                      {item.item?.type === 'digital' && (
                        <Button size="sm" className="flex items-center">
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/account/orders">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform">
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span className="text-sm">View All Orders</span>
                </Button>
              </Link>
              
              <Link href="/products">
                <Button variant="outline" className="w-full h-14 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform">
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span className="text-sm">Continue Shopping</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full h-14 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      url: window.location.origin
                    });
                  }
                }}
              >
                <StarIcon className="h-5 w-5" />
                <span className="text-sm">Share Store</span>
              </Button>
            </div>

            {/* Thank You Message */}
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                🎉 You're all set! 🎉
              </h3>
              <p className="text-muted-foreground">
                We've sent a confirmation email with all the details. Enjoy your purchase!
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Need help? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link></p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}