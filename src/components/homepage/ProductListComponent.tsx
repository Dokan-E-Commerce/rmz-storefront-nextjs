'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ui/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleVariants } from '@/lib/animations';

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
      options?: any;
    };
  };
}

export default function ProductListComponent({ component }: ProductListComponentProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isRTL = locale === 'ar';

  const { title, products = [], view_all_link, settings, options } = component.data;
  // The is_grid property is in settings object based on API response
  const isGrid = settings?.is_grid === true;
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
    <motion.section 
      className="py-20 bg-gradient-to-br from-background via-background to-muted/20"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl mb-6"
            variants={scaleVariants}
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            animate={{
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              scale: { type: "spring", stiffness: 300, damping: 10 },
              rotate: { type: "tween", duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <motion.svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              whileHover={{ scale: 1.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </motion.svg>
          </motion.div>
          <motion.h2 
            className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4"
            variants={fadeInUp}
          >
            {title}
          </motion.h2>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mb-6"
            variants={fadeInUp}
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
          {view_all_link && (
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={view_all_link}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="font-medium">View All</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Products Display */}
        {isGrid ? (
          <>
            {/* Grid Layout - All Devices */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {products.slice(0, 12).map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard 
                    product={product} 
                    variant="default"
                    showAddToCart={true}
                    showWishlist={true}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <>
            {/* Mobile Horizontal Scroll */}
            <motion.div 
              className="block md:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="overflow-x-auto scrollbar-hide scroll-smooth">
                <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                  {products.slice(0, 8).map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="flex-shrink-0 w-64"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <ProductCard 
                        product={product} 
                        variant="default"
                        showAddToCart={true}
                        showWishlist={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Desktop Carousel */}
            <motion.div 
              className="relative hidden md:block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    initial={{ x: isRTL ? -100 : 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: isRTL ? 100 : -100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {(() => {
                      const slideProducts = products.slice(currentSlide * itemsPerSlide, (currentSlide + 1) * itemsPerSlide);
                      return slideProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProductCard 
                            product={product} 
                            variant="default"
                            showAddToCart={true}
                            showWishlist={true}
                          />
                        </motion.div>
                      ));
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation - Desktop Only */}
              {products.length > itemsPerSlide && (
              <>
                <motion.button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-lg transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-border/50`}
                  aria-label="Previous products"
                  whileHover={{ scale: 1.1, x: isRTL ? 2 : -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                >
                  {isRTL ? (
                    <ChevronRightIcon className="h-6 w-6" />
                  ) : (
                    <ChevronLeftIcon className="h-6 w-6" />
                  )}
                </motion.button>
                <motion.button
                  onClick={nextSlide}
                  disabled={currentSlide >= maxSlides}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 bg-card/80 hover:bg-card text-foreground p-2 rounded-full shadow-lg transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-border/50`}
                  aria-label="Next products"
                  whileHover={{ scale: 1.1, x: isRTL ? -2 : 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                >
                  {isRTL ? (
                    <ChevronLeftIcon className="h-6 w-6" />
                  ) : (
                    <ChevronRightIcon className="h-6 w-6" />
                  )}
                </motion.button>
              </>
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
}