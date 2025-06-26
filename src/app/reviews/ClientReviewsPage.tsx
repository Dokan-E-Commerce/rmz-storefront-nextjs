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
  reviewer: Reviewer;
  product: Product;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: {
    [key: string]: number;
  };
}

export default function ClientReviewsPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const { ref, inView } = useInView();

  // Fetch review stats
  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['review-stats'],
    queryFn: reviewsApi.getStats,
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
    queryKey: ['reviews', sortBy, filterRating],
    queryFn: ({ pageParam = 1 }) =>
      reviewsApi.getAll({
        page: pageParam,
        per_page: 10,
        sort: sortBy,
        rating: filterRating,
      }),
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('customer_reviews')}</h1>
          
          {/* Review Stats */}
          {stats && (
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    {renderStars(Math.round(stats.average_rating), 'md')}
                    <span className="ml-2 text-2xl font-bold text-foreground">
                      {stats.average_rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {t('based_on_reviews', { count: stats.total_reviews })}
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
                              stats.total_reviews > 0
                                ? ((stats.rating_breakdown[rating] || 0) / stats.total_reviews) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground">
                        {stats.rating_breakdown[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground"
          >
            <option value="newest">{t('newest_first')}</option>
            <option value="oldest">{t('oldest_first')}</option>
            <option value="highest">{t('highest_rated')}</option>
            <option value="lowest">{t('lowest_rated')}</option>
          </select>

          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground"
          >
            <option value="">{t('all_ratings')}</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} {t('stars')}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 animate-pulse">
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
              </div>
            ))}
          </div>
        ) : allReviews.length > 0 ? (
          <div className="space-y-6">
            {allReviews.map((review: Review) => (
              <div
                key={review.id}
                className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {review.reviewer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-foreground">{review.reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-foreground mb-4 leading-relaxed">{review.comment}</p>

                {review.product && (
                  <div className="pt-4 border-t border-border/50">
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>{t('reviewed_product')}: {review.product.name}</span>
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {/* Load More Trigger */}
            {hasNextPage && (
              <div ref={ref} className="flex justify-center py-8">
                {isFetchingNextPage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                ) : (
                  <Button
                    onClick={() => fetchNextPage()}
                    variant="outline"
                    className="bg-card/30 backdrop-blur-md border-border/50 hover:bg-muted/50"
                  >
                    {t('load_more_reviews')}
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <StarOutlineIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">{t('no_reviews_yet')}</h2>
            <p className="text-muted-foreground mb-6">{t('be_first_to_review')}</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {t('browse_products')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}