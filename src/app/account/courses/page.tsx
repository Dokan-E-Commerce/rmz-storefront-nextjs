'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/store-api';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import AccountLayout from '@/components/layout/AccountLayout';

export default function CoursesPage() {
  const { t } = useTranslation();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      // Placeholder until courses API is implemented
      return [];
    },
  });

  return (
    <AccountLayout>
      <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-6">
        <h3 className="text-2xl font-semibold text-foreground mb-6">My Courses</h3>
        
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
                    {enrollment.course?.title}
                  </h4>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {enrollment.progress}% Complete
                  </span>
                </div>
                
                {enrollment.course?.description && (
                  <p className="text-muted-foreground mb-4">
                    {enrollment.course.description}
                  </p>
                )}
                
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {enrollment.is_active ? (
                      <span className="text-green-600 dark:text-green-400">● Active</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">● Inactive</span>
                    )}
                  </div>
                  <Link 
                    href={`/courses/${enrollment.id}`} 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Continue Learning →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Enrolled Courses</h3>
            <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet</p>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}