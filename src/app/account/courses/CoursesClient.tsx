'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/lib/store-api';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import AccountLayout from '@/components/layout/AccountLayout';

export default function CoursesClient() {
  const { t } = useTranslation();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      return await coursesApi.getAll();
    },
  });

  return (
    <AccountLayout>
      <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
        <h3 className="text-2xl font-semibold text-foreground mb-6">{t('my_courses')}</h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-border rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : courses?.length ? (
          <div className="space-y-4">
            {courses.map((enrollment: any) => (
              <div key={enrollment.id} className="border border-border rounded-xl p-6 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-foreground">
                    {enrollment.course?.name || enrollment.course?.title || enrollment.course?.product?.name || enrollment.title || enrollment.name || 'Untitled Course'}
                  </h4>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {enrollment.progress}% {t('complete')}
                  </span>
                </div>

                {(enrollment.course?.description || enrollment.course?.short_description || enrollment.course?.product?.description || enrollment.description) && (
                  <p className="text-muted-foreground mb-4">
                    {(() => {
                      const description = enrollment.course?.description || enrollment.course?.short_description || enrollment.course?.product?.description || enrollment.description;
                      // Remove HTML tags and limit to 120 characters
                      const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
                      return cleanDescription.length > 120 
                        ? cleanDescription.substring(0, 120) + '...'
                        : cleanDescription;
                    })()}
                  </p>
                )}

                {/* Course Details */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {enrollment.course?.instructor && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      👨‍🏫 {enrollment.course.instructor}
                    </span>
                  )}
                  {enrollment.course?.level && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      📊 {enrollment.course.level === 'beginner' ? t('beginner') : enrollment.course.level === 'intermediate' ? t('intermediate') : enrollment.course.level === 'advanced' ? t('advanced') : enrollment.course.level}
                    </span>
                  )}
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress || 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {enrollment.is_active ? (
                      <span className="text-green-600 dark:text-green-400">● {t('active')}</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">● {t('inactive')}</span>
                    )}
                  </div>
                  <Link
                    href={`/account/courses/${enrollment.id}`}
                    className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    {t('continue_learning')} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('no_enrolled_courses')}</h3>
            <p className="text-muted-foreground mb-6">{t('no_courses_description')}</p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
