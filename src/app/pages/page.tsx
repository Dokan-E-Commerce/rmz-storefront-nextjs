'use client';

import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '@/lib/store-api';
import { useTranslation } from '@/lib/useTranslation';
import Link from 'next/link';
import { CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PagesListing() {
  const { t } = useTranslation();
  
  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: pagesApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card p-6 rounded-lg border">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Pages
          </h1>
          <p className="text-muted-foreground">
            Browse all available pages
          </p>
        </div>

        {/* Pages List */}
        {pages && pages.length > 0 ? (
          <div className="space-y-6">
            {pages.map((page: any) => (
              <div key={page.id} className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow">
                <Link href={`/pages/${page.url}`} className="block group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {page.title}
                        </h3>
                      </div>
                      
                      {page.excerpt && (
                        <p className="text-muted-foreground mb-3 leading-relaxed">
                          {page.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {new Date(page.updated_at).toLocaleDateString('ar-SA', {
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Pages Found
            </h3>
            <p className="text-muted-foreground">
              There are currently no pages available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}