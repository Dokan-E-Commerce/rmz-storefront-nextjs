'use client';

import React from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { useStore } from '@/components/StoreProvider';
import { useLanguage } from '@/components/LanguageProvider';

interface MaintenanceModeProps {
  reason?: string;
  estimatedTime?: string;
}

export default function MaintenanceMode({ reason, estimatedTime }: MaintenanceModeProps) {
  const { t } = useTranslation();
  const { store } = useStore();
  const { isRTL } = useLanguage();


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 text-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto text-center px-6">
        {/* Store Logo */}
        {store?.logo && (
          <div className="mb-8">
            <img
              src={store.logo}
              alt={store.name}
              className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg"
            />
          </div>
        )}


        {/* Store Name */}
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          {store?.name || 'Digital Store'}
        </h1>

        {/* Maintenance Title */}
        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
          {t('maintenance_title')}
        </h2>

        {/* Maintenance Reason */}
        {reason && reason.trim() && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2 text-foreground">
              {t('maintenance_reason_title')}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {reason.trim()}
            </p>
          </div>
        )}

        {/* Estimated Time */}
        {estimatedTime && estimatedTime.trim() && (
          <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-medium mb-2 text-primary">
              {t('maintenance_estimated_time')}
            </h3>
            <p className="text-primary text-sm">
              {estimatedTime.trim()}
            </p>
          </div>
        )}


        {/* Contact Information */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('maintenance_contact')}
          </p>
          
          {/* Store Contact Info */}
          {store?.contact_info && (
            <div className="flex flex-col space-y-2">
              {store.contact_info.email && (
                <a
                  href={`mailto:${store.contact_info.email}`}
                  className="inline-flex items-center justify-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <i className="fas fa-envelope text-sm"></i>
                  <span className="text-sm">{store.contact_info.email}</span>
                </a>
              )}
              
              {store.contact_info.phone && (
                <a
                  href={`tel:${store.contact_info.phone}`}
                  className="inline-flex items-center justify-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <i className="fas fa-phone text-sm"></i>
                  <span className="text-sm">{store.contact_info.phone}</span>
                </a>
              )}
            </div>
          )}

          {/* Social Links */}
          {store?.social_links && store.social_links.length > 0 && (
            <div className="flex justify-center space-x-4">
              {store.social_links.map((social, index) => {
                const getSocialIcon = (method: string) => {
                  switch (method.toLowerCase()) {
                    case 'facebook': return 'fab fa-facebook';
                    case 'twitter': return 'fab fa-twitter';
                    case 'instagram': return 'fab fa-instagram';
                    case 'linkedin': return 'fab fa-linkedin';
                    case 'youtube': return 'fab fa-youtube';
                    case 'tiktok': return 'fab fa-tiktok';
                    case 'snapchat': return 'fab fa-snapchat';
                    case 'whatsapp': return 'fab fa-whatsapp';
                    case 'telegram': return 'fab fa-telegram';
                    default: return 'fas fa-link';
                  }
                };

                return (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
                    title={social.method}
                  >
                    <i className={`${getSocialIcon(social.method)} text-sm`}></i>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <i className="fas fa-refresh text-sm"></i>
            <span>{t('maintenance_refresh')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}