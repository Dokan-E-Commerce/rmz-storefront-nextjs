'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  BookOpenIcon, 
  ArrowLeftIcon, 
  PlayIcon, 
  ClockIcon, 
  CheckCircleIcon,
  LockClosedIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/useTranslation';
import { useAuth } from '@/lib/auth';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  // Courses API not yet available in SDK - using placeholder
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      // Placeholder course data until courses API is implemented
      return {
        course: {
          id: parseInt(id),
          name: 'Sample Course',
          description: 'This is a sample course description.',
          estimated_duration: 1800, // 30 minutes
          difficulty_level: 'Beginner',
          image: {
            url: '/placeholder-course.jpg',
            alt: 'Course thumbnail'
          },
          instructor: 'Sample Instructor',
          price: '99.00',
          total_modules: 5,
          total_duration_hours: 8
        },
        can_access: true,
        progress: 0,
        is_active: true,
        is_completed: false,
        enrolled_at: new Date().toISOString(),
        completed_modules: []
      }
    },
  });

  const { data: moduleData, isLoading: moduleLoading } = useQuery({
    queryKey: ['course-modules', id],
    queryFn: async () => {
      // Placeholder module data
      return {
        resources: []
      }
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <BookOpenIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('login_required')}</h1>
            <p className="text-muted-foreground mb-8">Please log in to access course content.</p>
            <Link href={`/login?redirect=/courses/${id}`}>
              <Button className="w-full">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-8">This course doesn't exist or you don't have access to it.</p>
            <Link href="/courses">
              <Button>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/courses" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Courses
        </Link>
        
        <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Course Image */}
            <div className="w-full lg:w-80 h-48 lg:h-60 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl overflow-hidden mb-6 lg:mb-0 flex-shrink-0">
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
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {course.course?.name || 'Untitled Course'}
              </h1>
              
              {course.course?.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {course.course.description}
                </p>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{course.progress || 0}%</div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
                
                {course.course?.total_modules && (
                  <div className="bg-muted/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{course.course.total_modules}</div>
                    <div className="text-sm text-muted-foreground">Modules</div>
                  </div>
                )}
                
                {course.course?.estimated_duration && (
                  <div className="bg-muted/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{Math.round(course.course.estimated_duration / 60)}h</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                )}
                
                <div className="bg-muted/20 rounded-lg p-4 text-center">
                  <div className="text-lg font-bold text-foreground">{course.course?.difficulty_level || 'Beginner'}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{course.progress || 0}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {course.is_active && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Active Enrollment
                  </span>
                )}
                
                {course.is_completed && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                )}
                
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-1" />
                  Enrolled {new Date(course.enrolled_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Modules */}
        <div className="lg:col-span-2">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-foreground mb-6">Course Modules</h2>
            
            {/* Module List Placeholder */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((moduleNum) => {
                const isCompleted = course.completed_modules?.includes(moduleNum);
                const isAccessible = course.can_access && (moduleNum === 1 || course.completed_modules?.includes(moduleNum - 1));
                
                return (
                  <div 
                    key={moduleNum}
                    className={`border border-border/50 rounded-lg p-4 transition-all duration-200 ${
                      isAccessible ? 'hover:bg-muted/20 cursor-pointer' : 'opacity-60'
                    } ${selectedModule === moduleNum ? 'bg-primary/10 border-primary/50' : ''}`}
                    onClick={() => isAccessible && setSelectedModule(moduleNum)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isAccessible 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircleIcon className="h-5 w-5" />
                          ) : isAccessible ? (
                            <PlayIcon className="h-5 w-5" />
                          ) : (
                            <LockClosedIcon className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-foreground">
                            Module {moduleNum}: Introduction to Course Content
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Learn the basics and fundamentals
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <ClockIcon className="h-4 w-4" />
                        <span>15 min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="lg:col-span-1">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 shadow-xl sticky top-8">
            {selectedModule ? (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Module {selectedModule} Content
                </h3>
                
                {moduleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted/20 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Video Lesson</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Watch the video content for this module
                      </p>
                      <Button className="w-full">
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Play Video
                      </Button>
                    </div>
                    
                    <div className="bg-muted/20 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2">Resources</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Additional materials and downloads
                      </p>
                      <Button variant="outline" className="w-full">
                        View Resources
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // Mark module as complete
                      }}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a Module
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose a module from the left to view its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}