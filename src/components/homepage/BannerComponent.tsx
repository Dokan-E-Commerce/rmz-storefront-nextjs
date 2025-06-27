'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { slideVariants, scaleVariants, fadeInUp } from '@/lib/animations';

interface BannerImage {
  id: number;
  url: string;
  full_link: string;
  alt_text?: string;
  link_url?: string;
  sort_order: number;
}

interface BannerComponentProps {
  component: {
    id: number;
    type: string;
    name: string;
    data: {
      type?: 'carousel' | 'single';
      images: BannerImage[];
      settings: any;
    };
  };
}

export default function BannerComponent({ component }: BannerComponentProps) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = component.data.images || [];
  const isRTL = locale === 'ar';

  if (!images.length) return null;

  const isCarousel = component.data.type === 'carousel' || images.length > 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const BannerImage = ({ image, className = "" }: { image: BannerImage; className?: string }) => {
    const imageContent = (
      <motion.div 
        className={`relative w-full h-80 md:h-96 lg:h-[600px] ${className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Image
          src={image.full_link || image.url}
          alt={image.alt_text || 'Banner'}
          fill
          className="object-cover"
          priority={currentSlide === 0}
        />
        {/* Overlay gradient for better text readability */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
          whileHover={{ opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );

    if (image.link_url) {
      return (
        <Link href={image.link_url} className="block">
          {imageContent}
        </Link>
      );
    }

    return imageContent;
  };

  if (isCarousel) {
    return (
      <motion.section 
        className="py-12 bg-gradient-to-br from-background to-muted/10 relative overflow-hidden"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="relative group"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <div className="overflow-hidden rounded-3xl shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="flex"
                  initial={{ x: isRTL ? -100 : 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isRTL ? 100 : -100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex-shrink-0 w-full">
                    <BannerImage image={images[currentSlide]} className="rounded-3xl" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Enhanced Navigation arrows */}
            <motion.button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-border/20 z-10"
              aria-label="Previous slide"
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </motion.button>
            <motion.button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-border/20 z-10"
              aria-label="Next slide"
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </motion.button>

            {/* Enhanced Dots indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <motion.div 
                className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-4 py-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-primary scale-125'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  whileHover={{ scale: index === currentSlide ? 1.4 : 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
              </motion.div>
            </div>

            {/* Slide counter */}
            <motion.div 
              className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              key={currentSlide}
            >
              {currentSlide + 1} / {images.length}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  // Single banner
  return (
    <motion.section 
      className="py-12 bg-gradient-to-br from-background to-muted/5 relative overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          className="relative group"
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="overflow-hidden rounded-3xl shadow-2xl"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <BannerImage image={images[0]} className="rounded-3xl" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
