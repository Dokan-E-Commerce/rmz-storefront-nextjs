'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/components/LanguageProvider';

export default function NotFound() {
  const { locale } = useLanguage();

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        'page_not_found': 'الصفحة غير موجودة',
        'page_missing': 'الصفحة التي تبحث عنها غير موجودة',
        'back_home': 'العودة للرئيسية'
      },
      en: {
        'page_not_found': 'Page Not Found',
        'page_missing': 'The page you are looking for does not exist',
        'back_home': 'Go Home'
      }
    };
    return translations[locale]?.[key] || translations['en'][key] || key;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">{t('page_not_found')}</h2>
        <p className="text-muted-foreground">{t('page_missing')}</p>
        
        <Link href="/">
          <Button className="mt-6">
            <HomeIcon className="w-4 h-4 mr-2" />
            {t('back_home')}
          </Button>
        </Link>
      </div>
    </div>
  );
}