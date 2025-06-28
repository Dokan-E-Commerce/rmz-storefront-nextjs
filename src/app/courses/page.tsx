'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/courses');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to courses...</p>
      </div>
    </div>
  );
}