'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/store-api';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function ClientCategoriesPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">{locale === 'ar' ? 'تحميل الأقسام...' : 'Loading categories...'}</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: t('categories'), href: '/categories', current: true }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('categories')}</h1>
        <p className="text-lg text-muted-foreground">{locale === 'ar' ? 'تصفح المنتجات حسب القسم' : 'Browse products by category'}</p>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-6 text-center hover:shadow-xl hover:border-border/80 transition-all duration-300 hover:scale-105"
              style={{ 
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {category.icon || '📦'}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="text-sm text-muted-foreground">
                {category.products_count || 0} {locale === 'ar' ? 'منتج' : 'products'}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-xl p-12 shadow-xl max-w-md mx-auto">
            <div className="text-6xl mb-4">📂</div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{locale === 'ar' ? 'لا توجد أقسام' : 'No Categories Found'}</h2>
            <p className="text-muted-foreground mb-8">{locale === 'ar' ? 'نحن نعمل على تنظيم منتجاتنا. تفقد مرة أخرى قريباً!' : "We're working on organizing our products. Check back soon!"}</p>
            <Link href="/products">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                {t('view_all_products')}
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}