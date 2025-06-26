'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/components/LanguageProvider';

export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { locale } = useLanguage();

  // Prepare structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.href
    }))
  };

  return (
    <>
      {/* Structured Data for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Visual Breadcrumbs */}
      <nav 
        className={`flex ${className}`} 
        aria-label={locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'}
      >
        <ol className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Home Icon */}
          <li>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={locale === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
            >
              <HomeIcon className="h-4 w-4" />
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
              {item.current ? (
                <span className="ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}