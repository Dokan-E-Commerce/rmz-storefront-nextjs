'use client';

import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/store-api';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';

interface Reviewer {
  id: number;
  name: string;
  email?: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: Reviewer;
  product?: Product; // Product is optional for store reviews
  type?: 'store' | 'product'; // Review type
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export default function ClientReviewsPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [reviewType, setReviewType] = useState<'all' | 'store' | 'product'>('all');
  const { ref, inView } = useInView();

  // Fetch review stats
  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['review-stats'],
    queryFn: () => reviewsApi.getStats(),
  });

  // Fetch reviews with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['reviews', sortBy, filterRating, reviewType],
    queryFn: ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        per_page: 10,
        sort: sortBy,
        rating: filterRating,
        type: reviewType === 'all' ? undefined : reviewType,
      };
      
      return reviewsApi.getAll(params);
    },
    getNextPageParam: (lastPage: any, pages) => {
      const nextPage = pages.length + 1;
      return lastPage.data?.length === 10 ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  // Load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all reviews from pages
  const allReviews = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data || []);
  }, [data]);

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIcon className={`${starSize} text-yellow-400`} />
            ) : (
              <StarOutlineIcon className={`${starSize} text-gray-300`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('reviews')}</h1>
            <p className="text-muted-foreground">{t('error_loading_reviews')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-4"
            variants={fadeInUp}
          >
            {t('customer_reviews')}
          </motion.h1>
          
          {/* Review Stats */}
          {stats && (
            <motion.div 
              className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 mb-6"
              variants={fadeInUp}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <motion.div 
                  className="mb-4 md:mb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="flex items-center mb-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    {renderStars(Math.round(stats.average_rating), 'md')}
                    <span className="ml-2 text-2xl font-bold text-foreground">
                      {stats.average_rating.toFixed(1)}
                    </span>
                  </motion.div>
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {t('based_on_reviews', { count: stats.total_reviews })}
                  </motion.p>
                </motion.div>
                
                {/* Rating Breakdown */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {[5, 4, 3, 2, 1].map((rating, index) => (
                    <motion.div 
                      key={rating} 
                      className="flex items-center text-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <span className="w-8 text-muted-foreground">{rating}★</span>
                      <div className="w-24 h-2 bg-muted rounded-full mx-2 overflow-hidden">
                        <motion.div
                          className="h-2 bg-yellow-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${
                              stats.total_reviews > 0 && stats.rating_distribution
                                ? ((stats.rating_distribution[rating.toString() as keyof typeof stats.rating_distribution] || 0) / stats.total_reviews) * 100
                                : 0
                            }%`,
                          }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <motion.span 
                        className="text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        {stats.rating_distribution ? (stats.rating_distribution[rating.toString() as keyof typeof stats.rating_distribution] || 0) : 0}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Filters and Sorting */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.select
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value as any)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="all">{locale === 'ar' ? 'جميع التقييمات' : 'All Reviews'}</option>
            <option value="store">{locale === 'ar' ? 'تقييمات المتجر' : 'Store Reviews'}</option>
            <option value="product">{locale === 'ar' ? 'تقييمات المنتجات' : 'Product Reviews'}</option>
          </motion.select>

          <motion.select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="newest">{t('newest_first')}</option>
            <option value="oldest">{t('oldest_first')}</option>
            <option value="highest">{t('highest_rated')}</option>
            <option value="lowest">{t('lowest_rated')}</option>
          </motion.select>

          <motion.select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="">{t('all_ratings')}</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} {t('stars')}
              </option>
            ))}
          </motion.select>
        </motion.div>

        {/* Reviews List */}
        <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="loading"
          >
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i} 
                className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.div 
                  className="animate-pulse"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ type: 'tween', duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : allReviews.length > 0 ? (
          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="hidden"
            key="reviews"
          >
            {allReviews.map((review: Review, index) => (
              <motion.div
                key={review.id}
                className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ 
                  y: -4, 
                  scale: 1.01,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div 
                  className="flex items-start justify-between mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="text-primary font-medium">
                        {review.reviewer?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </motion.div>
                    <motion.div 
                      className="ml-3 rtl:ml-0 rtl:mr-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="font-medium text-foreground">{review.reviewer?.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(review.created_at)}</p>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  >
                    {renderStars(review.rating)}
                  </motion.div>
                </motion.div>

                <motion.p 
                  className="text-foreground mb-4 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {review.comment}
                </motion.p>

                <motion.div 
                  className="flex items-center justify-between pt-4 border-t border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div 
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {review.product ? (
                      <>
                        <motion.span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          whileHover={{ scale: 1.05 }}
                        >
                          {locale === 'ar' ? 'تقييم منتج' : 'Product Review'}
                        </motion.span>
                        <Link
                          href={`/products/${review.product.slug}`}
                          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <motion.span
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            {review.product.name}
                          </motion.span>
                          <motion.svg
                            className="w-4 h-4 ml-1 rtl:ml-0 rtl:mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            whileHover={{ x: 2, rotate: 45 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </motion.svg>
                        </Link>
                      </>
                    ) : (
                      <motion.span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        whileHover={{ scale: 1.05 }}
                      >
                        {locale === 'ar' ? 'تقييم متجر' : 'Store Review'}
                      </motion.span>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <motion.div 
                ref={ref} 
                className="flex justify-center py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isFetchingNextPage ? (
                  <motion.div 
                    className="rounded-full h-8 w-8 border-b-2 border-primary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => fetchNextPage()}
                      variant="outline"
                      className="bg-card/30 backdrop-blur-md border-border/50 hover:bg-muted/50 transition-all duration-200"
                    >
                      {t('load_more_reviews')}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            key="empty"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                type: 'tween',
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <StarOutlineIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            </motion.div>
            <motion.h2 
              className="text-xl font-medium text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('no_reviews_yet')}
            </motion.h2>
            <motion.p 
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t('be_first_to_review')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200">
                  {t('browse_products')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}