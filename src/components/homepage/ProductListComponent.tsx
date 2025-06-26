'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: {
    original: string;
    actual: string;
    discount?: string;
    formatted: string;
    formatted_original: string;
    discount_percentage: number;
    currency: string;
  };
  image?: {
    id: number;
    url?: string;
    full_link?: string;
    path: string;
    filename: string;
    alt_text?: string;
  };
  rating?: number;
  reviews_count?: number;
  is_discounted?: boolean;
}

interface ProductListComponentProps {
  component: {
    id: number;
    type: string;
    name: string;
    data: {
      title: string;
      products: Product[];
      view_all_link?: string;
      settings: any;
    };
  };
}

export default function ProductListComponent({ component }: ProductListComponentProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isRTL = locale === 'ar';

  const { title, products = [], view_all_link, settings } = component.data;
  const isGrid = settings?.is_grid || false;
  const itemsPerSlide = 4;

  if (!products || products.length === 0) {
    return null;
  }

  const totalSlides = Math.ceil(products.length / itemsPerSlide);
  const maxSlides = Math.max(0, totalSlides - 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-6"></div>
          {view_all_link && (
            <Link
              href={view_all_link}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="font-medium">View All</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Products Display */}
        {isGrid || products.length <= 4 ? (
          // Grid layout
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, isGrid ? 12 : 4).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                variant="default"
                showAddToCart={true}
                showWishlist={true}
              />
            ))}
          </div>
        ) : (
          // Carousel layout
          <div className="relative">
            <div className="overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: isRTL 
                    ? `translateX(${currentSlide * 100}%)` 
                    : `translateX(-${currentSlide * 100}%)` 
                }}
              >
                {Array.from({ length: totalSlides }, (_, slideIndex) => {
                  const slideProducts = products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide);
                  return (
                    <div key={slideIndex} className="flex-shrink-0 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {slideProducts.map((product) => (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            variant="default"
                            showAddToCart={true}
                            showWishlist={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            {products.length > itemsPerSlide && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-lg transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-border/50`}
                  aria-label="Previous products"
                >
                  {isRTL ? (
                    <ChevronRightIcon className="h-6 w-6" />
                  ) : (
                    <ChevronLeftIcon className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= maxSlides}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-lg transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-border/50`}
                  aria-label="Next products"
                >
                  {isRTL ? (
                    <ChevronLeftIcon className="h-6 w-6" />
                  ) : (
                    <ChevronRightIcon className="h-6 w-6" />
                  )}
                </button>

              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}