'use client';

import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '@/lib/store-api';
import { notFound } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

interface ClientPageDetailProps {
  url: string;
  initialPage?: any;
}

export default function ClientPageDetail({ url, initialPage }: ClientPageDetailProps) {
  const { locale } = useLanguage();

  const { data: page, isLoading, error, isError } = useQuery({
    queryKey: ['page', url],
    queryFn: () => pagesApi.getPage(url),
    initialData: initialPage,
    retry: 2, // Retry failed requests
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only call notFound if we have no initial data AND the page is truly not found
  // Don't call notFound on network errors or temporary issues
  if (!page && !initialPage && !isLoading) {
    // Add a small delay to ensure this isn't a temporary loading issue
    if (isError) {
      notFound();
    }
  }

  // If we have initial data but the refetch failed, show the initial data
  const currentPage = page || initialPage;

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {locale === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'لم يتم العثور على الصفحة المطلوبة.' : 'The requested page could not be found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show loading indicator if refetching in background */}
        {isError && !isLoading && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {locale === 'ar' ? 'تعذر تحديث المحتوى. يتم عرض النسخة المحفوظة.' : 'Unable to refresh content. Showing cached version.'}
            </p>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {currentPage.title}
          </h1>

          {currentPage.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentPage.excerpt}
            </p>
          )}
        </div>

        {/* Page Content */}
        <div className="prose prose-lg max-w-none text-center">
          <div
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentPage.content }}
          />
        </div>

        {/* Page Meta */}
        {currentPage.updated_at && (
          <div className="mt-12 pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'آخر تحديث:' : 'Last Updated:'} {new Date(currentPage.updated_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
