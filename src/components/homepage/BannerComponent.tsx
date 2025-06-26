'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/lib/useTranslation';
import { useLanguage } from '@/components/LanguageProvider';

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
      <div className={`relative w-full h-80 md:h-96 lg:h-[600px] ${className}`}>
        <Image
          src={image.full_link || image.url}
          alt={image.alt_text || 'Banner'}
          fill
          className="object-cover"
          priority={currentSlide === 0}
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>
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
      <section className="py-12 bg-gradient-to-br from-background to-muted/10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative group">
            <div className="overflow-hidden rounded-3xl shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ 
                  transform: isRTL 
                    ? `translateX(${currentSlide * 100}%)` 
                    : `translateX(-${currentSlide * 100}%)`
                }}
              >
                {images.map((image, index) => (
                  <div key={image.id} className="flex-shrink-0 w-full">
                    <BannerImage image={image} className="rounded-3xl" />
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Navigation arrows */}
            <button
              onClick={isRTL ? nextSlide : prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-border/20"
              aria-label="Previous slide"
            >
              {isRTL ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
            </button>
            <button
              onClick={isRTL ? prevSlide : nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-border/20"
              aria-label="Next slide"
            >
              {isRTL ? <ChevronLeftIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
            </button>

            {/* Enhanced Dots indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? 'w-8 h-3 bg-gradient-to-r from-primary to-primary/90'
                      : 'w-3 h-3 bg-muted-foreground/50 hover:bg-muted-foreground/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide counter */}
            <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentSlide + 1} / {images.length}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Single banner
  return (
    <section className="py-12 bg-gradient-to-br from-background to-muted/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative group">
          <div className="overflow-hidden rounded-3xl shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]">
            <BannerImage image={images[0]} className="rounded-3xl" />
          </div>


        </div>
      </div>
    </section>
  );
}
