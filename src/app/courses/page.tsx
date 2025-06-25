'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, FunnelIcon, PlayIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/useTranslation';
import { useAuth } from '@/lib/auth';

export default function CoursesPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = useMemo(() => ({
    per_page: 20
  }), [searchTerm, sortBy]);

  // Courses API not yet available in SDK - using placeholder
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      // Placeholder courses data until courses API is implemented
      return {
        data: [
          {
            enrolled_at: '2024-01-15T10:00:00Z'
          },
          {
            enrolled_at: '2024-02-01T10:00:00Z'
          }
        ],
        pagination: {
          total: 2
        }
      }
    },
  });

  const courses = coursesData?.data || [];

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    
    return courses.filter((course: any) =>
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <BookOpenIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Login Required</h1>
            <p className="text-muted-foreground mb-8">Please log in to view your enrolled courses.</p>
            <Link href="/login?redirect=/courses">
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <BookOpenIcon className="h-8 w-8 mr-3 text-primary" />
            My Courses
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey with enrolled courses
          </p>
        </div>
        
        {/* Search */}
        <div className="relative mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-background/50 backdrop-blur-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {/* Floating Filter Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-full w-14 h-14 p-0"
        >
          <FunnelIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 hidden md:flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="relative bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="created_desc">Recently Enrolled</option>
                <option value="created_asc">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="progress_desc">Most Progress</option>
                <option value="progress_asc">Least Progress</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSortBy('created_desc');
                  setSearchTerm('');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
            
            <div className="flex justify-end mt-6 pt-6 border-t border-border/50 col-span-full">
              <Button
                onClick={() => setShowFilters(false)}
                className="px-8"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden animate-pulse">
              <div className="h-48 bg-muted/50"></div>
              <div className="p-6">
                <div className="h-4 bg-muted/50 rounded mb-2"></div>
                <div className="h-4 bg-muted/50 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-muted/50 rounded w-1/3"></div>
                  <div className="h-8 bg-muted/50 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: any) => (
            <div key={course.id} className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                {course.course?.image ? (
                  <img 
                    src={course.course.image.url} 
                    alt={course.course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpenIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Progress Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {course.course?.name || course.name || 'Untitled Course'}
                </h3>
                
                {course.course?.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.course.description}
                  </p>
                )}

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-4">
                    {course.course?.total_modules && (
                      <div className="flex items-center">
                        <PlayIcon className="h-4 w-4 mr-1" />
                        {course.course.total_modules} modules
                      </div>
                    )}
                    {course.course?.estimated_duration && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {Math.round(course.course.estimated_duration / 60)}h
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {course.course?.difficulty_level || 'Beginner'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <Button className="w-full">
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </Link>
                  
                  {course.is_completed && (
                    <Button variant="outline" size="sm">
                      <span className="text-green-600">✓</span>
                    </Button>
                  )}
                </div>

                {/* Enrollment Date */}
                <div className="mt-4 text-xs text-muted-foreground">
                  Enrolled {new Date(course.enrolled_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <BookOpenIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {searchTerm ? 'No Courses Found' : 'No Enrolled Courses'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? `No courses match "${searchTerm}"`
                : 'You haven\'t enrolled in any courses yet. Browse our course catalog to start learning.'
              }
            </p>
            <div className="space-y-3">
              {searchTerm ? (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
                </Button>
              ) : (
                <Link href="/products?type=course">
                  <Button>Browse Courses</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 rounded-t-xl shadow-2xl">
            <div className="flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="created_desc">Recently Enrolled</option>
                    <option value="created_asc">Oldest First</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                    <option value="progress_desc">Most Progress</option>
                    <option value="progress_asc">Least Progress</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-border/50 space-y-3">
                <Button
                  onClick={() => {
                    setSortBy('created_desc');
                    setSearchTerm('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}