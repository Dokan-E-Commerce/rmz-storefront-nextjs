'use client';

import { use, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/store-api';
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

interface CourseDetailClientProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailClient({ params }: CourseDetailClientProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

  // Get course from the actual API
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      try {
        const courseData = await coursesApi.getById(parseInt(id));
        return courseData as any; // Cast to any to handle the CourseEnrollment structure
      } catch (error) {
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  const { data: moduleData, isLoading: moduleLoading } = useQuery({
    queryKey: ['course-modules', id, selectedModule],
    queryFn: async () => {
      if (!selectedModule) return null;
      try {
        const moduleData = await coursesApi.getModule(parseInt(id), selectedModule);
        return moduleData as any; // Cast to any to handle the module structure
      } catch (error) {
        return null;
      }
    },
    enabled: isAuthenticated && selectedModule !== null,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <BookOpenIcon className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-4">{t('login_required')}</h1>
              <p className="text-muted-foreground mb-8">{t('login_to_access_course')}</p>
              <Link href={`/login?redirect=/account/courses/${id}`}>
                <Button className="w-full bg-primary hover:bg-primary/90">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading_course')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-foreground mb-4">{t('course_not_found')}</h1>
              <p className="text-muted-foreground mb-8">{t('course_no_access')}</p>
              <Link href="/account/courses">
                <Button className="bg-primary hover:bg-primary/90">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  {t('back_to_courses')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use actual course sections and modules from API
  const courseSections = course.course?.sections || [];
  
  // Flatten modules from all sections for the module list
  const courseModules = courseSections.flatMap((section: any) => 
    section.modules?.map((module: any) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      content: module.content,
      video_url: module.video_url,
      type: module.type,
      duration_minutes: module.duration_minutes || 15,
      sort_index: module.sort_index,
      section_id: section.id,
      section_title: section.title
    })) || []
  );

  // Only use fallback if we have no sections AND no modules
  const hasRealSections = courseSections.length > 0;
  const hasRealModules = courseModules.length > 0;
  
  const modules = hasRealModules ? courseModules : Array.from({ length: course?.course?.total_modules || 5 }, (_, i) => ({
    id: i + 1,
    title: `Module ${i + 1}: Course Content`,
    description: 'Learn the basics and fundamentals',
    duration_minutes: 15,
    sort_index: i + 1,
    section_title: 'Course Content'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account/courses" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('back_to_courses')}
          </Link>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
               {/* Course Image */}
               <div className="w-full lg:w-80 h-48 lg:h-60 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl overflow-hidden mb-8 lg:mb-0 flex-shrink-0">
                 {course?.course?.image?.url ? (
                   <img 
                     src={course.course.image.url} 
                     alt={course.course.image.alt || course.course.name || 'Course Image'}
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                     <BookOpenIcon className="h-16 w-16 text-primary/60" />
                   </div>
                 )}
               </div>

              {/* Course Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  {course.course?.name || 'Untitled Course'}
                </h1>
                
                {course.course?.short_description && (
                  <p className="text-lg text-muted-foreground mb-6">
                    {course.course.short_description}
                  </p>
                )}

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                    <div className="text-2xl font-bold text-primary">{Math.round(course.progress || 0)}%</div>
                    <div className="text-sm text-muted-foreground">{t('progress')}</div>
                  </div>
                  
                  {course.course?.total_modules > 0 && (
                    <div className="bg-muted/20 rounded-lg p-4 text-center border border-border/30">
                      <div className="text-2xl font-bold text-foreground">{course.course.total_modules}</div>
                      <div className="text-sm text-muted-foreground">{t('modules')}</div>
                    </div>
                  )}
                  
                  {course.course?.estimated_duration > 0 && (
                    <div className="bg-muted/20 rounded-lg p-4 text-center border border-border/30">
                      <div className="text-2xl font-bold text-foreground">{Math.round(course.course.estimated_duration / 60)}h</div>
                      <div className="text-sm text-muted-foreground">{t('duration')}</div>
                    </div>
                  )}
                  
                  <div className="bg-muted/20 rounded-lg p-4 text-center border border-border/30">
                    <div className="text-lg font-bold text-foreground">{course.course?.difficulty_level || 'Beginner'}</div>
                    <div className="text-sm text-muted-foreground">{t('level')}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-medium text-foreground">{t('overall_progress')}</span>
                     <span className="text-sm text-muted-foreground">{Math.round(Number(course.progress) || 0)}%</span>
                   </div>
                   <div className="w-full bg-muted/30 rounded-full h-3">
                     <div 
                       className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500" 
                       style={{ width: `${Number(course.progress) || 0}%` }}
                     ></div>
                   </div>
                 </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                   {course?.is_active && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                       <CheckCircleIcon className="h-4 w-4 mr-1" />
                       {t('active_enrollment')}
                     </span>
                   )}
                   
                   {course?.is_completed && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                       <CheckCircleIcon className="h-4 w-4 mr-1" />
                       {t('completed')}
                     </span>
                   )}
                   
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                     <UserIcon className="h-4 w-4 mr-1" />
                     {t('enrolled')} {new Date(course?.enrolled_at || Date.now()).toLocaleDateString()}
                   </span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Course Modules */}
          <div className="lg:col-span-1">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t('course_modules')}</h2>
              
              {/* Course Sections and Modules */}
              <div className="space-y-4">
                {hasRealSections ? courseSections.map((section: any) => (
                  <div key={`section-${section.id}`} className="border border-border/50 rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-muted/20 border-b border-border/50 p-3">
                      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                    </div>
                    
                    {/* Section Modules */}
                    <div className="divide-y divide-border/30">
                      {section.modules?.map((module: any, moduleIndex: number) => {
                        const isCompleted = course?.completed_modules?.includes(module.id) || false;
                        const isAccessible = course?.can_access && (moduleIndex === 0 || course?.completed_modules?.includes(section.modules[moduleIndex - 1]?.id));
                        
                        return (
                          <div 
                            key={`module-${module.id}`}
                            className={`p-3 transition-all duration-200 ${
                              isAccessible ? 'hover:bg-muted/20 cursor-pointer hover:border-primary/30' : 'opacity-60'
                            } ${selectedModule === module.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                            onClick={() => isAccessible && setSelectedModule(module.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isAccessible 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircleIcon className="h-3 w-3" />
                                ) : isAccessible ? (
                                  <PlayIcon className="h-3 w-3" />
                                ) : (
                                  <LockClosedIcon className="h-3 w-3" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate">
                                  {module.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    module.type === 'media' 
                                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  }`}>
                                    {module.type === 'media' ? t('video') : t('text')}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {module.duration_minutes} {t('min')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )) : (
                  // Fallback to simple module list if no sections
                  <div className="space-y-2">
                    {modules.map((module, index) => {
                      const isCompleted = course?.completed_modules?.includes(module.id) || false;
                      const isAccessible = course?.can_access && (index === 0 || course?.completed_modules?.includes(modules[index - 1]?.id));
                     
                     return (
                       <div 
                         key={`module-${module.id}`}
                         className={`border border-border/50 rounded-lg p-3 transition-all duration-200 ${
                           isAccessible ? 'hover:bg-muted/20 cursor-pointer hover:border-primary/30' : 'opacity-60'
                         } ${selectedModule === module.id ? 'bg-primary/10 border-primary/50' : ''}`}
                         onClick={() => isAccessible && setSelectedModule(module.id)}
                       >
                         <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                             isCompleted 
                               ? 'bg-green-500 text-white' 
                               : isAccessible 
                                 ? 'bg-primary text-primary-foreground' 
                                 : 'bg-muted text-muted-foreground'
                           }`}>
                             {isCompleted ? (
                               <CheckCircleIcon className="h-3 w-3" />
                             ) : isAccessible ? (
                               <PlayIcon className="h-3 w-3" />
                             ) : (
                               <LockClosedIcon className="h-3 w-3" />
                             )}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             <h3 className="text-sm font-medium text-foreground truncate">
                               {module.title}
                             </h3>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-xs text-muted-foreground">
                                 {module.duration_minutes} {t('min')}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-3">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg min-h-[600px]">
              {selectedModule ? (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {t('module_content')}
                  </h3>
                  
                  {moduleLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Get the selected module data */}
                      {(() => {
                        const currentModule = courseModules.find(m => m.id === selectedModule);
                        if (!currentModule) return null;
                        
                        return (
                          <>
                            {/* Module Header */}
                            <div className="border-b border-border/30 pb-4">
                              <h4 className="font-semibold text-foreground mb-2">{currentModule.title}</h4>
                              {currentModule.description && (
                                <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  currentModule.type === 'media' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}>
                                  {currentModule.type === 'media' ? '🎥 ' + t('video') : '📄 ' + t('text')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {currentModule.duration_minutes} {t('min')}
                                </span>
                              </div>
                            </div>

                            {/* Module Content */}
                            <div className="mb-6">
                              {currentModule.type === 'media' && currentModule.video_url ? (
                                // Video Content
                                <div className="bg-muted/20 rounded-lg p-6 border border-border/30">
                                  <h4 className="font-medium text-foreground mb-4 flex items-center">
                                    <PlayIcon className="h-5 w-5 mr-2" />
                                    {t('video_lesson')}
                                  </h4>
                                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                    <video 
                                      controls 
                                      className="w-full h-full"
                                      poster="/api/placeholder/800/450"
                                    >
                                      <source src={currentModule.video_url} type="video/mp4" />
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                </div>
                              ) : (
                                // Text Content
                                <div className="bg-muted/20 rounded-lg p-6 border border-border/30">
                                  <h4 className="font-medium text-foreground mb-4 flex items-center">
                                    <BookOpenIcon className="h-5 w-5 mr-2" />
                                    {t('lesson_content')}
                                  </h4>
                                  {currentModule.content ? (
                                    <div 
                                      className="prose prose-base dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-a:text-primary"
                                      dangerouslySetInnerHTML={{ __html: currentModule.content }}
                                    />
                                  ) : (
                                    <p className="text-muted-foreground">
                                      {t('no_content_available')}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Mark Complete Button */}
                            <div className="flex gap-4">
                              {(() => {
                                const isCompleted = course?.completed_modules?.includes(selectedModule) || false;
                                return (
                                  <Button 
                                    className={`flex-1 ${isCompleted 
                                      ? 'bg-gray-500 cursor-not-allowed' 
                                      : 'bg-green-600 hover:bg-green-700'} text-white`}
                                    disabled={isCompleted}
                                    onClick={async () => {
                                  try {
                                    // Mark module as complete - use the actual course ID from the data
                                    const courseId = course?.course?.id;
                                    if (courseId && selectedModule) {
                                      const result = await coursesApi.completeModule(courseId, selectedModule);
                                      
                                      // Refresh the course data to show updated progress
                                      queryClient.invalidateQueries({ queryKey: ['course', id] });
                                      
                                    }
                                  } catch (error) {
                                    }
                                  }}
                                  >
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    {isCompleted ? t('completed') : t('mark_as_complete')}
                                  </Button>
                                );
                              })()}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpenIcon className="h-12 w-12 text-primary/60 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('select_module')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('choose_module_content')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 