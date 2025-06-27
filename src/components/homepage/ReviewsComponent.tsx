import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageProvider';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';

interface Review {
  id: number;
  customer_name?: string;
  name?: string;
  rating: number;
  comment: string;
  created_at: string;
  product_name?: string;
  product?: {
    name: string;
    slug?: string;
  };
  reviewer?: {
    name: string;
  };
  type?: 'store' | 'product';
}

interface ReviewsComponentProps {
  className?: string;
  component?: any;
}

export default function ReviewsComponent({ className = '' }: ReviewsComponentProps) {
  const { locale } = useLanguage();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredReview, setHoveredReview] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['store-reviews'],
    queryFn: async () => {
      try {
        const result = await sdk.reviews.getRecent(6);
        // Return only store reviews for homepage
        const allReviews = (result as any)?.data || result || [];
        // Filter to show only store reviews (reviews without product)
        return allReviews.filter((review: any) => !review.product);
      } catch (error) {
        return [];
      }
    },
  });

  // Responsive reviews per slide
  const getReviewsPerSlide = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1; // Mobile
    if (window.innerWidth < 1024) return 2; // Tablet
    return 3; // Desktop
  };
  
  const [reviewsPerSlide, setReviewsPerSlide] = useState(getReviewsPerSlide());
  
  // Update reviews per slide on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setReviewsPerSlide(getReviewsPerSlide());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const totalSlides = Math.ceil(reviews.length / reviewsPerSlide);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card p-6 rounded-xl border animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="w-4 h-4 bg-muted rounded mr-1"></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <motion.section 
      className={`py-16 bg-background ${className}`}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold tracking-tight text-foreground mb-4"
            variants={fadeInUp}
          >
            {t('customer_reviews')}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            {locale === 'ar' 
              ? 'اكتشف تجارب العملاء الحقيقية مع منتجاتنا وخدماتنا'
              : 'Discover genuine customer experiences with our products and services'
            }
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 rtl:left-auto rtl:right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hidden sm:flex"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4 rtl:hidden" />
                <ChevronRight className="h-4 w-4 hidden rtl:block" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 rtl:right-auto rtl:left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hidden sm:flex"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4 rtl:hidden" />
                <ChevronLeft className="h-4 w-4 hidden rtl:block" />
              </Button>
            </>
          )}

          {/* Reviews Container */}
          <div 
            className="overflow-hidden px-0 sm:px-12 rtl:sm:px-0" 
            ref={containerRef}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const startX = touch.clientX;
              const handleTouchMove = (e: TouchEvent) => {
                const touch = e.touches[0];
                const diff = startX - touch.clientX;
                if (Math.abs(diff) > 50) {
                  if (diff > 0) {
                    nextSlide();
                  } else {
                    prevSlide();
                  }
                  document.removeEventListener('touchmove', handleTouchMove);
                }
              };
              document.addEventListener('touchmove', handleTouchMove);
              document.addEventListener('touchend', () => {
                document.removeEventListener('touchmove', handleTouchMove);
              }, { once: true });
            }}
          >
            <motion.div
              className="flex"
              animate={{ x: locale === 'ar' ? `${currentSlide * 100}%` : `-${currentSlide * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Create slides based on reviewsPerSlide */}
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-12">
                    {reviews
                      .slice(slideIndex * reviewsPerSlide, (slideIndex + 1) * reviewsPerSlide)
                      .map((review, reviewIndex) => (
                        <motion.div
                          key={review.id}
                          className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-lg transition-all"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: reviewIndex * 0.1 }}
                          whileHover={{ y: -5 }}
                          onHoverStart={() => setHoveredReview(review.id)}
                          onHoverEnd={() => setHoveredReview(null)}
                        >
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-semibold text-lg">
                                  {(review as any).reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {(review as any).reviewer?.name || (locale === 'ar' ? 'عميل' : 'Customer')}
                                </h4>
                                <time className="text-xs text-muted-foreground">
                                  {new Date(review.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                </time>
                              </div>
                            </div>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center mb-3">
                            {renderStars(review.rating)}
                          </div>
                          
                          {/* Comment */}
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
                            "{review.comment}"
                          </p>
                          
                          {/* Product info if available */}
                          {review.product && (
                            <div className="mt-4 pt-4 border-t border-border">
                              {review.product.slug ? (
                                <Link
                                  href={`/products/${review.product.slug}`}
                                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                  {locale === 'ar' ? 'المنتج:' : 'Product:'} {review.product.name}
                                </Link>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  {locale === 'ar' ? 'المنتج:' : 'Product:'} {review.product.name}
                                </p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <motion.div 
              className="flex justify-center space-x-2 rtl:space-x-reverse mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {Array.from({ length: totalSlides }).map((_, i) => (
                <motion.button
                  key={i}
                  className={`transition-all duration-300 ${
                    i === currentSlide 
                      ? 'w-8 h-2 bg-primary rounded-full' 
                      : 'w-2 h-2 bg-muted rounded-full hover:bg-muted-foreground/50'
                  }`}
                  onClick={() => setCurrentSlide(i)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: i === currentSlide ? 1.1 : 1 }}
                />
              ))}
            </motion.div>
          )}

          {/* View More Link */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/reviews">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="px-6 py-2">
                  {locale === 'ar' ? 'عرض جميع التقييمات' : 'View All Reviews'}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
