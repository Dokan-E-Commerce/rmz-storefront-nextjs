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
  reviewer: Reviewer | null;
  product: Product | null;
}

interface ReviewsResponse {
  data: Review[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    [key: string]: number;
  };
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
          ) : (
            <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300`} />
          )}
        </span>
      ))}
    </div>
  );
}

function RatingDistribution({ distribution, total }: { distribution: { [key: string]: number }; total: number }) {

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={rating} className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 w-12">
              <span className="text-sm font-medium">{rating}</span>
              <StarIcon className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="flex-1 bg-muted/50 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewsPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'store' | 'product'>('all');
  const [perPage] = useState(15);

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  // Query parameters
  const queryParams = useMemo(() => ({
    per_page: perPage,
    rating: ratingFilter || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  }), [ratingFilter, typeFilter, perPage]);

  // Fetch reviews with infinite scroll
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['reviews', queryParams],
    queryFn: ({ pageParam = 1 }) => reviewsApi.getAll({
      ...queryParams,
      page: pageParam,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage.pagination && lastPage.pagination.current_page < lastPage.pagination.last_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });

  // Auto-load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into single array
  const allReviews = useMemo(() => {
    return reviewsData?.pages.flatMap(page => page.data) || [];
  }, [reviewsData]);

  // Fetch review statistics
  const { data: statsData, isLoading: statsLoading } = useQuery<ReviewStats>({
    queryKey: ['reviews-stats'],
    queryFn: () => reviewsApi.getStats(),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRatingFilter = (rating: number | null) => {
    setRatingFilter(rating);
  };

  const handleTypeFilter = (type: 'all' | 'store' | 'product') => {
    setTypeFilter(type);
  };

  if (reviewsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted/50 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card p-6 rounded-lg border">
                    <div className="h-4 bg-muted/50 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-muted/50 rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="h-6 bg-muted/50 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-3 bg-muted/50 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = statsData || { total_reviews: 0, average_rating: 0, rating_distribution: {} };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('reviews')}</h1>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'تقييمات وآراء العملاء' : 'Customer Reviews and Ratings'}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Type Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground mr-2">
                  {locale === 'ar' ? 'نوع المراجعة:' : 'Review Type:'}
                </span>
                <Button
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter('all')}
                >
                  {locale === 'ar' ? 'جميع المراجعات' : 'All Reviews'}
                </Button>
                <Button
                  variant={typeFilter === 'store' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter('store')}
                >
                  {locale === 'ar' ? 'مراجعات المتجر' : 'Store Reviews'}
                </Button>
                <Button
                  variant={typeFilter === 'product' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter('product')}
                >
                  {locale === 'ar' ? 'مراجعات المنتجات' : 'Product Reviews'}
                </Button>
              </div>

              {/* Rating Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-foreground mr-2">
                  {locale === 'ar' ? 'التقييم:' : 'Rating:'}
                </span>
                <Button
                  variant={ratingFilter === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRatingFilter(null)}
                >
                  {locale === 'ar' ? 'جميع التقييمات' : 'All Ratings'}
                </Button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Button
                    key={rating}
                    variant={ratingFilter === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRatingFilter(rating)}
                    className="flex items-center space-x-1"
                  >
                    <span>{rating}</span>
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {allReviews.length === 0 && !reviewsLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <StarOutlineIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {locale === 'ar' ? 'لم يتم العثور على مراجعات' : 'No Reviews Found'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {ratingFilter || typeFilter !== 'all'
                    ? (locale === 'ar' ? 'لا توجد مراجعات تطابق الفلاتر المحددة.' : 'No reviews match your current filters.')
                    : (locale === 'ar' ? 'كن أول من يترك مراجعة!' : 'Be the first to leave a review!')
                  }
                </p>
                <Link href="/products">
                  <Button>{locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {allReviews.map((review) => (
                  <div key={review.id} className="bg-card p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {review.reviewer?.name ? review.reviewer.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {review.reviewer?.name || (locale === 'ar' ? 'مراجع مجهول' : 'Anonymous Reviewer')}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{formatDate(review.created_at)}</span>
                            {review.product && (
                              <>
                                <span>•</span>
                                <Link
                                  href={`/products/${(review.product as any).slug || review.product.id}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {(review.product as any).name || `Product ${review.product.id}`}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="md" />
                    </div>
                    <p className="text-foreground leading-relaxed">{review.comment}</p>
                  </div>
                ))}

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isFetchingNextPage && (
                    <div className="space-y-6 w-full">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card p-6 rounded-lg border animate-pulse">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-muted/50 rounded-full"></div>
                              <div>
                                <div className="h-4 bg-muted/50 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-muted/50 rounded w-16"></div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="h-4 w-4 bg-muted/50 rounded"></div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted/50 rounded w-full"></div>
                            <div className="h-3 bg-muted/50 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!hasNextPage && allReviews.length > 0 && (
                    <div className="text-center text-muted-foreground">
                      {locale === 'ar' ? 'تم تحميل جميع المراجعات' : 'All reviews loaded'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
                        {/* Overall Rating */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {locale === 'ar' ? 'التقييم العام' : 'Overall Rating'}
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-foreground mb-2">
                  {(stats.average_rating || 0).toFixed(1)}
                </div>
                <StarRating rating={Math.round(stats.average_rating || 0)} size="lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  {locale === 'ar' ?
                    `بناءً على ${stats.total_reviews} مراجعة` :
                    `Based on ${stats.total_reviews} reviews`
                  }
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {locale === 'ar' ? 'توزيع التقييمات' : 'Rating Breakdown'}
              </h3>
              <RatingDistribution
                distribution={stats.rating_distribution}
                total={stats.total_reviews}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
